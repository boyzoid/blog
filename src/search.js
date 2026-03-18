/* eslint-disable no-undef */
const ALGOLIA_INDEX = process.env.ALGOLIA_INDEX;
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_API_KEY = process.env.ALGOLIA_SEARCH_API_KEY;

const searchContent = (e) => {
  const INDEX = ALGOLIA_INDEX;
  const APP_ID = ALGOLIA_APP_ID;
  const API_KEY = ALGOLIA_SEARCH_API_KEY;

  const keywords = e.target.value;
  const mainEl = document.getElementById("main-content");
  const tocEl = document.getElementById("toc");
  const searchContainerEl = document.getElementById("search-container");
  const noResultsEl = document.getElementById("search-no-results");

  if (!keywords) {
    mainEl.classList.remove("hidden");
    if (tocEl) tocEl.classList.remove("hidden");
    searchContainerEl.classList.add("hidden");
    return;
  }

  mainEl.classList.add("hidden");
  if (tocEl) tocEl.classList.add("hidden");
  searchContainerEl.classList.remove("hidden");

  fetch(
    `https://${APP_ID}-dsn.algolia.net/1/indexes/${INDEX}?query=${encodeURIComponent(keywords)}&hitsPerPage=20`,
    {
      headers: {
        "X-Algolia-Application-Id": APP_ID,
        "X-Algolia-API-Key": API_KEY
      }
    }
  )
    .then((r) => r.json())
    .then((json) => {
      const ulEl = document.getElementById("search-results");
      while (ulEl.lastChild) ulEl.lastChild.remove();
      if (json.hits.length === 0) {
        noResultsEl.classList.remove("hidden");
      } else {
        noResultsEl.classList.add("hidden");
        for (const item of json.hits) {
          const liEl = document.createElement("li");
          const aEl = document.createElement("a");
          aEl.setAttribute("href", item.url);
          aEl.textContent = item.title;
          liEl.appendChild(aEl);
          ulEl.appendChild(liEl);
        }
      }
    })
    .catch(console.error);
};

export { searchContent };
