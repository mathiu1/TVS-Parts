const ExcelJS = require('exceljs');
const path = require('path');

class LookupService {
  constructor() {
    this.parts = [];
    this.isLoaded = false;
  }

  async init() {
    try {
      console.log('📦 Loading data.xlsx for automated lookup...');
      const workbook = new ExcelJS.Workbook();
      const filePath = path.join(__dirname, '..', 'data.xlsx');
      await workbook.xlsx.readFile(filePath);
      
      const worksheet = workbook.getWorksheet(1);
      const partsMap = new Map();

      // Skip header row
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        
        // Row values: [empty, partNumber, description, bin, uomDimension]
        const values = row.values;
        if (!values[1]) return;

        const pNum = String(values[1]).trim();
        const loc = values[3] ? String(values[3]).trim() : '';

        if (partsMap.has(pNum)) {
          const part = partsMap.get(pNum);
          if (loc && !part.locations.has(loc)) {
            part.locations.add(loc);
          }
        } else {
          partsMap.set(pNum, {
            partNumber: pNum,
            description: values[2] ? String(values[2]).trim() : '',
            locations: new Set(loc ? [loc] : []),
            uomDimension: values[4] ? String(values[4]).trim() : ''
          });
        }
      });

      // Convert map to sorted data array
      const data = Array.from(partsMap.values()).map(p => ({
        ...p,
        location: Array.from(p.locations).join(', ')
      }));

      // Defensive sort by partNumber (strings)
      this.parts = data.sort((a, b) => a.partNumber.localeCompare(b.partNumber));
      this.isLoaded = true;
      console.log(`✅ Loaded ${this.parts.length} unique parts into lookup cache.`);
    } catch (err) {
      console.error('❌ Failed to load data.xlsx:', err.message);
    }
  }

  findPart(partNumber) {
    if (!this.isLoaded || !partNumber) return null;

    const target = String(partNumber).trim();
    let left = 0;
    let right = this.parts.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midVal = this.parts[mid].partNumber;

      if (midVal === target) {
        return this.parts[mid];
      }
      
      if (midVal < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return null;
  }
}

// Singleton instance
const lookupService = new LookupService();
module.exports = lookupService;
