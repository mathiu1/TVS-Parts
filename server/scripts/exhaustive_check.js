const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Part = require('../models/Part');

async function exhaustiveAnalysis() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(path.join(__dirname, '../data.xlsx'));
        const sheet = workbook.getWorksheet(1);
        
        console.log('--- EXHAUSTIVE ANALYSIS ---');
        
        const excelPNs = [];
        sheet.eachRow((r, i) => { if (i > 1) excelPNs.push(r.getCell(2).value?.toString()?.trim()); });
        
        const dbParts = await Part.find({}).select('partNumber');
        const dbPNs = dbParts.map(p => p.partNumber);
        
        console.log(`Excel Records: ${excelPNs.length}`);
        console.log(`DB Records: ${dbPNs.length}`);
        
        let exactMatch = 0;
        let partialMatch = 0;
        
        const dbSet = new Set(dbPNs);
        excelPNs.forEach(epn => {
            if (dbSet.has(epn)) exactMatch++;
            else {
                // Check for substrings or numerical matches
                for (const dbpn of dbPNs) {
                    if (dbpn.includes(epn) || epn.includes(dbpn)) {
                        partialMatch++;
                        if (partialMatch < 5) console.log(`Partial hit: Excel[${epn}] matches DB[${dbpn}]`);
                        break;
                    }
                }
            }
        });
        
        console.log(`Exact Matches: ${exactMatch}`);
        console.log(`Partial Matches: ${partialMatch}`);
        
        // Check first 5 DB parts against Excel specifically
        console.log('\nSample DB parts checking:');
        for(let i=0; i<5; i++) {
            console.log(`DB PN: ${dbPNs[i]}`);
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
exhaustiveAnalysis();
