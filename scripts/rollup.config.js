require("dotenv").config();
import { terser } from "rollup-plugin-terser";
const replace = require("@rollup/plugin-replace");
const siteconfig = require("../content/_data/siteconfig");

const isProduction = true; //process.env.NODE_ENV === "production";

export default {
  input: "src/index.js",
  treeshake: false,
  output: [
    {
      file: "assets/js/min.js",
      sourcemap: !isProduction,
      format: "esm"
    }
  ],
  plugins: [
    // Minify JS in production mode
    isProduction && terser(),
    // Replace env variables for Algolia, if enabled
    siteconfig.algoliaSearch &&
      siteconfig.algoliaSearch.enabled &&
      replace({
        preventAssignment: true,
        "process.env.ALGOLIA_INDEX": JSON.stringify(siteconfig.algoliaSearch.indexName),
        "process.env.ALGOLIA_APP_ID": JSON.stringify(siteconfig.algoliaSearch.appId),
        "process.env.ALGOLIA_SEARCH_API_KEY": JSON.stringify(siteconfig.algoliaSearch.searchApiKey)
      })
  ]
};
