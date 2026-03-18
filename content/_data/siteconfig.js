require("dotenv").config();

module.exports = {
  //Cloud Storage URl
  cloudUrl: 'https://idmqjyw9i2ib.objectstorage.us-ashburn-1.oci.customer-oci.com/n/idmqjyw9i2ib/b/blog/o/',
  cloudinaryHeaderUrl: 'https://res.cloudinary.com/strozstuff/image/fetch/c_fit,w_650/',
  cloudinaryPreviewUrl: 'https://res.cloudinary.com/strozstuff/image/fetch/c_fit,w_250/',
  cloudinaryUrl: 'https://res.cloudinary.com/strozstuff/image/fetch/',
  cloudianryVideoUrl: 'https://res.cloudinary.com/strozstuff/video/fetch/',
  // Website title, shown in left sidebar and in page title
  title: "The Stroz",
  // Site URL to generate absolute URLs. Used across the board.
  url: "https://stroz.dev",
  // Profile image for left sidebar
  image: "opengraph.jpg",
  // Image alt text for left sidebar
  imageAlt: "Scott Stroz",
  // Author name, shown in left sidebar, and used in JSON-LD
  author: "Scott Stroz",
  // Site description, shown below site image (optional)
  description:
    "Husband. Father. Coder.<br/>Golfer. Gamer.<br />Die-hard Giants fan.",
  descriptionNoTags: "Husband. Father. Coder. Golfer. Gamer. Die-hard Giants fan.",
  // OpenGraph default image, in case you don't have an `image`
  // set in your Markdown frontmatter; relevant for social
  // sharing.
  openGraphDefaultImage: "opengraph.jpg",
  // GitHub ID (optional, remove it not needed), used for link in the left sidebar
  socialGitHub: "boyzoid",
  // LinkedIn ID  (optional, remove it not needed), used for link in the left sidebar
  socialLinkedIn: "scott-stroz",
  // YouTube ID/Channel  (optional, remove it not needed), used for link in the left sidebar
  //socialYouTube: "UCH60RRaY2GI9m62z1loLjcA",
  // Google Analytics ID  (optional, remove it not needed), used for... well, Google Analytics
  googleAnalytics: "G-060Z992R2K",
  // Algolia-powered search  (optional, remove it not needed),
  // See: https://github.com/algolia/algoliasearch-netlify
  algoliaSearch: {
    // When enabled shows the search bar in the UI
    enabled: true,
    // Algolia Application ID
    appId: process.env.ALGOLIA_APP_ID,
    // Algolia Search-only API Key (safe to expose in frontend)
    searchApiKey: process.env.ALGOLIA_SEARCH_API_KEY,
    // Algolia index name
    indexName: process.env.ALGOLIA_INDEX || "stroz_blog"
  }
};
