// Vlog detail page with real-time comments using Socket.IO and Axios
const API_BASE_URL = "/api";

// Initialize Socket.IO
const socket = io();

let currentArticleId = ARTICLE_ID;

// Load vlog details
async function loadVlog() {
  const container = document.getElementById("vlog-detail");

  try {
    const response = await axios.get(
      `${API_BASE_URL}/vlogs/${currentArticleId}`
    );
    const vlog = response.data;

    container.innerHTML = `
      <article class="article-full">
        <div class="article-type vlog">VLOG</div>
        <h1>${vlog.Title}</h1>
        <div class="article-meta">
          <span class="date">${new Date(
            vlog.PublishedAt
          ).toLocaleDateString()}</span>
        </div>
        <div class="tags">
          ${vlog.Tags.map((tag) => `<span class="tag">#${tag}</span>`).join(
            " "
          )}
        </div>
        <div class="article-content">
          ${vlog.Content.split("\n")
            .map((p) => `<p>${p}</p>`)
            .join("")}
        </div>
      </article>
    `;
  } catch (error) {
    console.error("Error loading vlog:", error);
    container.innerHTML =
      '<p class="error">Failed to load vlog. Please try again later.</p>';
  }
}

// Load comments for the article
async function loadComments() {
  const container = document.getElementById("comments-container");

  try {
    const response = await axios.get(
      `${API_BASE_URL}/articles/${currentArticleId}/comments`
    );
    const comments = response.data;

    updateCommentCount(comments.length);

    if (comments.length === 0) {
      container.innerHTML =
        '<p class="no-data">No comments yet. Be the first to comment!</p>';
      return;
    }

    displayComments(comments);
  } catch (error) {
    console.error("Error loading comments:", error);
    container.innerHTML = '<p class="error">Failed to load comments.</p>';
  }
}

// Display comments in the DOM
function displayComments(comments) {
  const container = document.getElementById("comments-container");

  container.innerHTML = comments
    .map(
      (comment) => `
    <div class="comment" data-comment-id="${comment.CommentId}">
      <div class="comment-header">
        <strong class="comment-author">${comment.User.Username}</strong>
        <span class="comment-date">${new Date(
          comment.PublishedAt
        ).toLocaleString()}</span>
      </div>
      <div class="comment-content">
        ${comment.Content}
      </div>
    </div>
  `
    )
    .join("");
}

// Update comment count
function updateCommentCount(count) {
  const countElement = document.getElementById("comment-count");
  countElement.textContent = `(${count})`;
}

// Add a single comment to the list (for real-time updates)
function addCommentToList(comment) {
  const container = document.getElementById("comments-container");

  // Remove "no comments" message if exists
  const noData = container.querySelector(".no-data");
  if (noData) {
    container.innerHTML = "";
  }

  const commentHTML = `
    <div class="comment new-comment" data-comment-id="${comment.CommentId}">
      <div class="comment-header">
        <strong class="comment-author">👤 ${comment.User.Username}</strong>
        <span class="comment-date">${new Date(
          comment.PublishedAt
        ).toLocaleString()}</span>
      </div>
      <div class="comment-content">
        ${comment.Content}
      </div>
    </div>
  `;

  container.insertAdjacentHTML("afterbegin", commentHTML);

  // Remove highlight after animation
  setTimeout(() => {
    const newComment = container.querySelector(".new-comment");
    if (newComment) {
      newComment.classList.remove("new-comment");
    }
  }, 2000);

  // Update count
  const currentComments = container.querySelectorAll(".comment");
  updateCommentCount(currentComments.length);
}

// Handle comment form submission
function setupCommentForm() {
  const form = document.getElementById("comment-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userId = parseInt(document.getElementById("userId").value);
    const content = document.getElementById("content").value;

    if (!userId || !content.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      // Post comment via REST API using Axios
      const response = await axios.post(
        `${API_BASE_URL}/articles/${currentArticleId}/comments`,
        {
          UserId: userId,
          Content: content.trim(),
        }
      );

      const newComment = response.data;

      // Clear form
      form.reset();

      // Emit socket event to notify all clients (including the sender)
      socket.emit("comment:created", {
        comment: newComment,
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    }
  });
}

// Socket.IO event handlers
function setupSocketListeners() {
  // Join the room for this article
  socket.emit("join-article", currentArticleId);

  // Listen for new comments
  socket.on("comment:new", (comment) => {
    console.log("New comment received via socket:", comment);
    addCommentToList(comment);
  });

  // Handle errors
  socket.on("comment:error", (error) => {
    console.error("Socket error:", error);
    alert("Error: " + error.message);
  });

  // Connection status
  socket.on("connect", () => {});

  socket.on("disconnect", () => {});
}

// Cleanup when leaving the page
window.addEventListener("beforeunload", () => {
  socket.emit("leave-article", currentArticleId);
});

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
  loadVlog();
  loadComments();
  setupCommentForm();
  setupSocketListeners();
});
