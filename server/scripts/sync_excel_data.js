const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Part = require('../models/Part');

const ADMIN_ID = '69c7cabd01f3e4b665732fa4'; // Enterprise Default Admin ID

async function syncExcelToDB() {
    console.log('🚀 Starting Excel to Database Synchronization...');
    const excelPath = path.join(__dirname, '../data.xlsx');

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(excelPath);
        const worksheet = workbook.getWorksheet(1);

        const bulkOps = [];
        let rowCount = 0;

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const partNumber = row.getCell(1).value?.toString()?.trim();
            const description = row.getCell(2).value?.toString()?.trim();
            const location = row.getCell(3).value?.toString()?.trim();
            const uomDimension = row.getCell(4).value?.toString()?.trim();

            if (partNumber) {
                bulkOps.push({
                    updateOne: {
                        filter: { partNumber },
                        update: {
                            $set: {
                                description,
                                location,
                                uomDimension,
                                uploadedBy: ADMIN_ID
                            }
                        },
                        upsert: false // We only want to update existing parts from the Excel sync
                    }
                });
                rowCount++;
            }
        });

        console.log(`📊 Processing ${bulkOps.length} updates...`);

        if (bulkOps.length > 0) {
            // Processing in chunks of 500 to avoid memory issues
            const chunkSize = 500;
            let totalModified = 0;

            for (let i = 0; i < bulkOps.length; i += chunkSize) {
                const chunk = bulkOps.slice(i, i + chunkSize);
                const result = await Part.bulkWrite(chunk);
                totalModified += result.modifiedCount + result.upsertedCount;
                console.log(`✨ Progress: ${i + chunk.length}/${bulkOps.length} processed...`);
            }

            console.log(`\n🎉 Synchronization Complete!`);
            console.log(`✅ Total Rows Processed: ${rowCount}`);
            console.log(`✅ Total Records Updated: ${totalModified}`);
        } else {
            console.log('⚠️ No valid data found in Excel.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

syncExcelToDB();
