// Blogs page - load all blogs
const API_BASE_URL = "/api";

async function loadBlogs() {
  const container = document.getElementById("blogs-container");

  try {
    const response = await axios.get(`${API_BASE_URL}/blogs`);
    const blogs = response.data;

    if (blogs.length === 0) {
      container.innerHTML = '<p class="no-data">No blogs found.</p>';
      return;
    }

    container.innerHTML = blogs
      .map(
        (blog) => `
      <div class="article-card">
        <div class="article-type blog">BLOG</div>
        <h3>${blog.Title}</h3>
        <p class="excerpt">${blog.Excerpt}</p>
        <div class="meta">
          <span class="date">${new Date(
            blog.PublishedAt
          ).toLocaleDateString()}</span>
          <span class="readtime">${blog.Readtime} min</span>
        </div>
        <div class="tags">
          ${blog.Tags.map((tag) => `<span class="tag">#${tag}</span>`).join(
            " "
          )}
        </div>
        <a href="/blogs/${
          blog.ArticleId
        }" class="btn btn-primary">Read More</a>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading blogs:", error);
    container.innerHTML =
      '<p class="error">Failed to load blogs. Please try again later.</p>';
  }
}

// Load blogs when page loads
document.addEventListener("DOMContentLoaded", loadBlogs);
