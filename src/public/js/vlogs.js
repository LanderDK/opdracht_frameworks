// Vlogs page - load all vlogs
const API_BASE_URL = "/api";

async function loadVlogs() {
  const container = document.getElementById("vlogs-container");

  try {
    const response = await axios.get(`${API_BASE_URL}/vlogs`);
    const vlogs = response.data;

    if (vlogs.length === 0) {
      container.innerHTML = '<p class="no-data">No vlogs found.</p>';
      return;
    }

    container.innerHTML = vlogs
      .map(
        (vlog) => `
      <div class="article-card">
        <div class="article-type vlog">VLOG</div>
        <h3>${vlog.Title}</h3>
        <p class="excerpt">${vlog.Excerpt}</p>
        <div class="meta">
          <span class="date">${new Date(
            vlog.PublishedAt
          ).toLocaleDateString()}</span>
        </div>
        <div class="tags">
          ${vlog.Tags.map((tag) => `<span class="tag">#${tag}</span>`).join(
            " "
          )}
        </div>
        <a href="/vlogs/${
          vlog.ArticleId
        }" class="btn btn-primary">Watch Now</a>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading vlogs:", error);
    container.innerHTML =
      '<p class="error">Failed to load vlogs. Please try again later.</p>';
  }
}

// Load vlogs when page loads
document.addEventListener("DOMContentLoaded", loadVlogs);
