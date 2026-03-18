require("dotenv").config();
const { readFileSync } = require("fs");
const { join } = require("path");

const APP_ID = process.env.ALGOLIA_APP_ID;
const WRITE_API_KEY = process.env.ALGOLIA_WRITE_API_KEY;
const INDEX_NAME = process.env.ALGOLIA_INDEX || "stroz_blog";

if (!APP_ID || !WRITE_API_KEY) {
  console.error("Missing ALGOLIA_APP_ID or ALGOLIA_WRITE_API_KEY in environment");
  process.exit(1);
}

if (WRITE_API_KEY === "YOUR_ADMIN_API_KEY_HERE") {
  console.error("Please set ALGOLIA_WRITE_API_KEY in your .env file (find it in the Algolia dashboard under API Keys > Admin API Key)");
  process.exit(1);
}

const { algoliasearch } = require("algoliasearch");

const indexFile = join(process.cwd(), "_site", "search-index.json");
let records;
try {
  records = JSON.parse(readFileSync(indexFile, "utf-8"));
} catch (e) {
  console.error("Could not read _site/search-index.json — run the Eleventy build first");
  process.exit(1);
}

const client = algoliasearch(APP_ID, WRITE_API_KEY);

(async () => {
  try {
    const result = await client.saveObjects({
      indexName: INDEX_NAME,
      objects: records
    });
    console.log(`Algolia: indexed ${records.length} records into "${INDEX_NAME}"`);
    console.log(result);
  } catch (e) {
    console.error("Algolia indexing failed:", e.message);
    process.exit(1);
  }
})();
