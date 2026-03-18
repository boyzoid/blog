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
      const isDark = document.documentElement.classList.contains("dark");
      const titleColor = isDark ? "#9eafd4" : "#0B2265";
      const excerptColor = isDark ? "#9ca3af" : "#6b7280";
      while (ulEl.lastChild) ulEl.lastChild.remove();
      if (json.hits.length === 0) {
        noResultsEl.classList.remove("hidden");
      } else {
        noResultsEl.classList.add("hidden");
        for (const item of json.hits) {
          const liEl = document.createElement("li");
          const aEl = document.createElement("a");
          aEl.setAttribute("href", item.url);
          aEl.setAttribute("style", "display:flex;gap:0.75rem;align-items:flex-start;padding:0.75rem;text-decoration:none;");

          if (item.image) {
            const imgEl = document.createElement("img");
            imgEl.setAttribute("src", item.image);
            imgEl.setAttribute("alt", item.title);
            imgEl.setAttribute("style", "width:200px;height:140px;object-fit:cover;border-radius:0.25rem;flex-shrink:0;margin:0;display:block;");
            aEl.appendChild(imgEl);
          }

          const bodyEl = document.createElement("div");
          bodyEl.setAttribute("style", "flex:1;min-width:0;");

          const titleEl = document.createElement("div");
          titleEl.setAttribute("style", `font-size:1.125rem;font-weight:700;color:${titleColor};margin-bottom:0.5rem;`);
          titleEl.textContent = item.title;
          bodyEl.appendChild(titleEl);

          if (item.excerpt) {
            const excerptEl = document.createElement("div");
            excerptEl.setAttribute("style", `font-size:0.9rem;line-height:1.5;color:${excerptColor};overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;`);
            excerptEl.textContent = item.excerpt;
            bodyEl.appendChild(excerptEl);
          }

          aEl.appendChild(bodyEl);
          liEl.appendChild(aEl);
          ulEl.appendChild(liEl);
        }
      }
    })
    .catch(console.error);
};

export { searchContent };
