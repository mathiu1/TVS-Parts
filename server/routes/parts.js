const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Part = require('../models/Part');
const { protect, adminOnly } = require('../middleware/auth');
const { createPasswordZip } = require('../utils/zip');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const lookupService = require('../utils/lookupService');

const router = express.Router();

// Multer config — store in memory for Cloudinary upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB server-side limit (client compresses to 200kb)
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer, publicId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder: 'tvs-parts-list',
        resource_type: 'image',
        overwrite: true,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// GET /api/parts — Paginated list with search (optimized)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = search
      ? { partNumber: { $regex: search, $options: 'i' } }
      : {};

    const [parts, total] = await Promise.all([
      Part.find(query)
        .select('partNumber description location uomDimension imageUrl createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Part.countDocuments(query),
    ]);

    res.json({
      parts,
      page,
      totalPages: Math.ceil(total / limit),
      totalParts: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/parts/lookup/:partNumber — Fast lookup from Excel
router.get('/lookup/:partNumber', protect, (req, res) => {
  const details = lookupService.findPart(req.params.partNumber);
  if (!details) {
    return res.status(404).json({ message: 'Part not found in master list' });
  }
  res.json(details);
});

// GET /api/parts/:id — Single part
router.get('/:id', protect, async (req, res) => {
  try {
    const part = await Part.findById(req.params.id).populate('uploadedBy', 'username');
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }
    res.json(part);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/parts — Create new part
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { partNumber } = req.body;

    if (!partNumber || !req.file) {
      return res.status(400).json({ message: 'Part number and image are required' });
    }

    // Check for duplicate
    const existing = await Part.findOne({ partNumber: partNumber.trim() });
    if (existing) {
      return res.status(409).json({ message: 'Part already exists' });
    }

    // Upload to Cloudinary with partNumber as public_id
    const result = await uploadToCloudinary(req.file.buffer, partNumber.trim());

    const { description, location, uomDimension } = req.body;

    const part = await Part.create({
      partNumber: partNumber.trim(),
      description,
      location,
      uomDimension,
      imageUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      uploadedBy: req.user._id,
    });

    res.status(201).json(part);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Part already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/parts/:id — Update part (Admin only)
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }

    const { partNumber, description, location, uomDimension } = req.body;

    // If partNumber changed, check for duplicates
    if (partNumber && partNumber.trim() !== part.partNumber) {
      const existing = await Part.findOne({ partNumber: partNumber.trim() });
      if (existing) {
        return res.status(409).json({ message: 'Part number already exists' });
      }
    }

    // If new image uploaded, re-upload to Cloudinary
    if (req.file) {
      // Delete old image from Cloudinary
      await cloudinary.uploader.destroy(part.cloudinaryPublicId);

      const newPublicId = partNumber ? partNumber.trim() : part.partNumber;
      const result = await uploadToCloudinary(req.file.buffer, newPublicId);

      part.imageUrl = result.secure_url;
      part.cloudinaryPublicId = result.public_id;
    } else if (partNumber && partNumber.trim() !== part.partNumber) {
      // If only partNumber changed (no new image), rename in Cloudinary
      const newPublicId = `tvs-parts-list/${partNumber.trim()}`;
      await cloudinary.uploader.rename(part.cloudinaryPublicId, newPublicId);
      part.cloudinaryPublicId = newPublicId;
    }

    if (partNumber) part.partNumber = partNumber.trim();
    if (description !== undefined) part.description = description;
    if (location !== undefined) part.location = location;
    if (uomDimension !== undefined) part.uomDimension = uomDimension;

    await part.save();
    res.json(part);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Part number already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/parts/:id — Delete part (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(part.cloudinaryPublicId);

    // Delete from DB
    await Part.findByIdAndDelete(req.params.id);

    res.json({ message: 'Part deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/parts/export/zip — Download all images as password-protected ZIP (Admin only)
router.get('/export/zip', protect, adminOnly, async (req, res) => {
  try {
    const parts = await Part.find({});

    if (parts.length === 0) {
      return res.status(404).json({ message: 'No parts to export' });
    }

    // Fetch all images
    const files = [];
    for (const part of parts) {
      try {
        const response = await axios.get(part.imageUrl, { responseType: 'arraybuffer' });
        const ext = part.imageUrl.split('.').pop().split('?')[0] || 'jpg';
        files.push({
          name: `${part.partNumber}.${ext}`,
          buffer: Buffer.from(response.data),
        });
      } catch (err) {
        console.warn(`Failed to fetch image for part ${part.partNumber}: ${err.message}`);
      }
    }

    if (files.length === 0) {
      return res.status(500).json({ message: 'Failed to fetch any images' });
    }

    const password = process.env.ZIP_PASSWORD || 'default_password';

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const tempFile = path.join(tempDir, `export-${Date.now()}.zip`);

    const outputStream = fs.createWriteStream(tempFile);
    await createPasswordZip(files, password, outputStream);

    const stat = fs.statSync(tempFile);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=tvs-parts-images.zip');
    res.setHeader('Content-Length', stat.size);

    const readStream = fs.createReadStream(tempFile);
    readStream.pipe(res);

    readStream.on('end', () => {
      fs.unlink(tempFile, (err) => {
        if (err) console.error('Cleanup temp err:', err);
      });
    });
  } catch (error) {
    console.error('ZIP export error:', error);
    res.status(500).json({ message: 'Failed to create ZIP archive' });
  }
});

// GET /api/parts/export/excel — Download all images and data as Excel (Admin only)
router.get('/export/excel', protect, adminOnly, async (req, res) => {
  try {
    const parts = await Part.find({});

    if (parts.length === 0) {
      return res.status(404).json({ message: 'No parts to export' });
    }

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('TVS Parts');

    worksheet.columns = [
      { key: 'partNumber', width: 25 },
      { key: 'description', width: 40 },
      { key: 'location', width: 25 },
      { key: 'uomDimension', width: 20 },
      { key: 'image', width: 45 },
    ];

    // Master Title Row
    worksheet.addRow(['TVS PARTS LIST REPORT']);
    worksheet.mergeCells('A1:E1');
    const titleCell = worksheet.getCell('A1');
    titleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // Sleeker dark blue/gray
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 45;

    // Data Headers Row
    worksheet.addRow(['Part Number', 'Description', 'Location', 'UOM Dimension', 'Original Image']);
    const headerRow = worksheet.getRow(2);
    headerRow.font = { size: 12, bold: true, color: { argb: 'FF1F2937' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    headerRow.height = 30;

    // Apply borders to headers
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
    });

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const rowNumber = i + 3; // Row 1 is Title, Row 2 is Headers

      // Process locations to be more readable in Excel (one per line)
      const formattedLocation = part.location ? part.location.split(',').map(l => l.trim()).join('\n') : '-';

      // Cast partNumber to Number to avoid Excel's "number stored as text" green warning triangle
      const numericPartNumber = !isNaN(part.partNumber) ? Number(part.partNumber) : part.partNumber;

      const row = worksheet.addRow({ 
        partNumber: numericPartNumber,
        description: part.description || '-',
        location: formattedLocation,
        uomDimension: part.uomDimension || '-'
      });
      row.height = 140; // Taller row for better image framing
      row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      // Apply borders to data cells
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
        // Ensure the font size is appropriately legible
        cell.font = { size: 12 };
      });

      // Fetch original image arraybuffer
      try {
        const response = await axios.get(part.imageUrl, { responseType: 'arraybuffer' });
        const ext = part.imageUrl.split('.').pop().split('?')[0] || 'jpg';
        
        const imageId = workbook.addImage({
          buffer: Buffer.from(response.data),
          extension: ext.toLowerCase() === 'png' ? 'png' : 'jpeg',
        });

        // Cell coordinate positioning: 'tl' is 0-indexed top-left corner
        // Repositioned to Column 5 (E) - index 4
        // Adjusted padding for perfect visual centering within the 45-width / 140-height cell
        worksheet.addImage(imageId, {
          tl: { col: 4.15, row: rowNumber - 1 + 0.15 }, 
          ext: { width: 170, height: 170 }, 
          editAs: 'oneCell' // Locks image so it moves/resizes nicely with the row
        });
      } catch (err) {
        console.warn(`Failed to fetch image for excel part ${part.partNumber}: ${err.message}`);
      }
    }

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const tempFile = path.join(tempDir, `export-excel-${Date.now()}.xlsx`);

    await workbook.xlsx.writeFile(tempFile);

    const stat = fs.statSync(tempFile);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=tvs-parts-list.xlsx');
    res.setHeader('Content-Length', stat.size);

    const readStream = fs.createReadStream(tempFile);
    readStream.pipe(res);

    readStream.on('end', () => {
      fs.unlink(tempFile, (err) => {
        if (err) console.error('Cleanup temp excel err:', err);
      });
    });

  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ message: 'Failed to create Excel file' });
  }
});

module.exports = router;
