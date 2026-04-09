const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Part = require('../models/Part');

async function checkOverlap() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(path.join(__dirname, '../data.xlsx'));
        const sheet = workbook.getWorksheet(1);
        
        const excelPNs = new Set();
        sheet.eachRow((r, i) => { if (i > 1) excelPNs.add(r.getCell(2).value?.toString()?.trim()); });
        
        const dbParts = await Part.find({ location: 'PORTAL' }).select('partNumber');
        let overlap = 0;
        dbParts.forEach(p => { if (excelPNs.has(p.partNumber)) overlap++; });
        
        console.log(`Excel Parts: ${excelPNs.size}`);
        console.log(`DB Portal Parts: ${dbParts.length}`);
        console.log(`Overlap: ${overlap}`);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkOverlap();
