// Home page - load all articles
const API_BASE_URL = "/api";

async function loadArticles() {
  const container = document.getElementById("articles-container");

  try {
    // Check for tag query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tag = urlParams.get("tag");

    // Update input field if tag exists
    const tagFilter = document.getElementById("tag-filter");
    if (tagFilter && tag) {
      tagFilter.value = tag;
    }

    const url = tag
      ? `${API_BASE_URL}/articles?tag=${encodeURIComponent(tag)}`
      : `${API_BASE_URL}/articles`;
    const response = await axios.get(url);
    const articles = response.data;

    if (articles.length === 0) {
      container.innerHTML = tag
        ? `<p class="no-data">No articles found with tag "${tag}".</p>`
        : '<p class="no-data">No articles found.</p>';
      return;
    }

    container.innerHTML = articles
      .map((article) => {
        const detailUrl =
          article.ArticleType === "blog"
            ? `/blogs/${article.ArticleId}`
            : `/vlogs/${article.ArticleId}`;

        return `
      <div class="article-card">
        <div class="article-type ${article.ArticleType.toLowerCase()}">${
          article.ArticleType
        }</div>
        <h3>${article.Title}</h3>
        <p class="excerpt">${article.Excerpt}</p>
        <div class="meta">
          <span class="date">${new Date(
            article.PublishedAt
          ).toLocaleDateString()}</span>
          ${
            article.Readtime
              ? `<span class="readtime">⏱${article.Readtime} min</span>`
              : ""
          }
        </div>
        <div class="tags">
          ${article.Tags.map(
            (t) =>
              `<span class="tag clickable" onclick="filterByTag('${t}')">#${t}</span>`
          ).join(" ")}
        </div>
        <a href="${detailUrl}" class="btn btn-primary">Read More</a>
      </div>
    `;
      })
      .join("");
  } catch (error) {
    console.error("Error loading articles:", error);
    container.innerHTML =
      '<p class="error">Failed to load articles. Please try again later.</p>';
  }
}

function filterByTag(tag) {
  window.location.href = `/?tag=${encodeURIComponent(tag)}`;
}

// Setup filter input
function setupFilter() {
  const tagFilter = document.getElementById("tag-filter");
  const clearBtn = document.getElementById("clear-filter");

  // Filter on Enter key
  tagFilter.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const tag = tagFilter.value.trim();
      if (tag) {
        filterByTag(tag);
      }
    }
  });

  // Clear filter button
  clearBtn.addEventListener("click", () => {
    window.location.href = "/";
  });
}

// Load articles when page loads
document.addEventListener("DOMContentLoaded", () => {
  setupFilter();
  loadArticles();
});
