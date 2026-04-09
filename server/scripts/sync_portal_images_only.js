const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Part = require('../models/Part');

const ADMIN_ID = '69c7cabd01f3e4b665732fa4';
const PORTAL_API = 'https://portal.schwingstetterindia.com/api/product/list';
const BATCH_SIZE = 100;
const IMAGE_CONCURRENCY = 50; // Simultaneous image checks

const HEADERS = {
  'Content-Type': 'application/json',
  'Referer': 'https://portal.schwingstetterindia.com/browse/collection/collection_1643826032413/1?query=%7B%22brands%22%3A%5B%22Default%22%5D%7D&sort=1',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

const getRequestBody = (from, size) => ({
  Mainquery: {
    from,
    size,
    query: {
      bool: {
        must: [
          { term: { isPublished: 1 } },
          { term: { 'brandsName.keyword': 'Default' } }
        ],
        must_not: [
          { match: { prodgrpIndexName: { query: 'PrdGrp0*' } } },
          { term: { internal: true } }
        ]
      }
    }
  },
  sort: [
    { 'brandProductId.keyword': 'asc' }
  ],
  ELASTIC_INDEX: 'ssindiapgandproducts'
});

async function checkImage(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Referer': 'https://portal.schwingstetterindia.com/'
      }
    });
    return response.status === 200;
  } catch (e) {
    return false;
  }
}

async function syncPartsWithValidation() {
  console.log('🚀 Starting STICT IMAGE-FIRST Schwing Portal Sync...');
  console.log('🔍 Analyzing 12,071 potential parts...');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let from = 0;
    let totalProcessed = 0;
    let totalValid = 0;
    let totalSkipped = 0;
    let hasMore = true;
    const processedIds = new Set();
    const uniqueValidIds = new Set();

    // Get total count first
    const initialResponse = await fetch(PORTAL_API, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(getRequestBody(0, 1))
    });
    const initialData = await initialResponse.json();
    const totalParts = initialData.data.hits.total;
    console.log(`📦 Total Portal Records: ${totalParts}`);

    while (hasMore) {
      console.log(`\n⏳ Fetching Batch ${from} to ${from + BATCH_SIZE}...`);

      const response = await fetch(PORTAL_API, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(getRequestBody(from, BATCH_SIZE))
      });

      const result = await response.json();
      const hits = result.data.hits.hits;

      if (!hits || hits.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`📸 Validating ${hits.length} images in parallel (Pool Size: ${IMAGE_CONCURRENCY})...`);

      const validatedParts = [];

      // Batch validation with concurrency control
      for (let i = 0; i < hits.length; i += IMAGE_CONCURRENCY) {
        const batch = hits.slice(i, i + IMAGE_CONCURRENCY);
        const results = await Promise.all(batch.map(async (hit) => {
          const source = hit._source;
          const partNumber = source.brandProductId;

          // PRIMARY: Standard spares_photos path
          const standardPath = `spares_photos/${partNumber}.jpg`;
          const standardUrl = `https://schwing-prod-app-assets.s3.ap-south-1.amazonaws.com/SSINDIA/app_assets/product_images/${standardPath}`;

          let isValid = await checkImage(standardUrl);
          let finalUrl = standardUrl;

          // SECONDARY: Fallback to Dynamic Metadata Path (Recovers parts like 10080782)
          if (!isValid && source.productAssetss && source.productAssetss[0]) {
            const dynamicPath = source.productAssetss[0].source;
            const dynamicUrl = `https://schwing-prod-app-assets.s3.ap-south-1.amazonaws.com/SSINDIA/app_assets/product_images/${dynamicPath}`;
            isValid = await checkImage(dynamicUrl);
            finalUrl = dynamicUrl;
          }

          return { hit, isValid, imageUrl: finalUrl };
        }));

        results.forEach(res => {
          const pid = res.hit._source.brandProductId;
          if (processedIds.has(pid)) {
             // Skip redundant processing of the same ID in this run
             return;
          }
          processedIds.add(pid);

          if (res.isValid) {
            validatedParts.push(res);
            uniqueValidIds.add(pid);
          } else {
            totalSkipped++;
          }
        });
      }

      if (validatedParts.length > 0) {
        const bulkOps = validatedParts.map(({ hit, imageUrl }) => {
          const source = hit._source;
          return {
            updateOne: {
              filter: { partNumber: source.brandProductId },
              update: {
                $set: {
                  partNumber: source.brandProductId,
                  description: source.pgName || source.productShortDescription || 'No description',
                  imageUrl,
                  location: 'PORTAL',
                  uomDimension: 'Units',
                  uploadedBy: ADMIN_ID
                }
              },
              upsert: true
            }
          };
        });

        const bulkResult = await Part.bulkWrite(bulkOps);
        totalValid += validatedParts.length;
        console.log(`✨ Batch complete: ${validatedParts.length} valid images found. Upserted: ${bulkResult.upsertedCount}, Modified: ${bulkResult.modifiedCount}`);
      } else {
        console.log(`⚠️ Batch skipped: No valid images found in these 100 parts.`);
      }

      totalProcessed += hits.length;
      from += BATCH_SIZE;

      if (from >= totalParts) {
        hasMore = false;
      }

      console.log(`📊 Progress: ${totalProcessed}/${totalParts} | Unique Valid: ${uniqueValidIds.size} | Skipped: ${totalSkipped}`);
    }

    // Final Cleanup: Remove bits from DB that were marked PORTAL but aren't in our new "Valid" list?
    // Actually, upserting will update the ones that have images. 
    // If the user wants to REMOVE ones without images, I should do a final pass.

    console.log(`\n🎉 Sync Finished!`);
    console.log(`✅ Total Unique Valid Parts: ${uniqueValidIds.size}`);
    console.log(`✅ Total Records Processed: ${totalProcessed}`);
    console.log(`🚫 Total Invalid (No Image) Skipped: ${totalSkipped}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

syncPartsWithValidation();
