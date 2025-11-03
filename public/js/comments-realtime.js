// Shared real-time comments functionality using Socket.IO and Axios
// This file handles real-time comment updates for both blogs and vlogs
const API_BASE_URL = "/api";

// Initialize Socket.IO (ARTICLE_ID is set in the Pug template)
const socket = io();

// Update comment count in the UI
function updateCommentCount(count) {
  const countElement = document.getElementById("comment-count");
  if (countElement) {
    countElement.textContent = `(${count})`;
  }
}

// Add a new comment to the list with animation
function addCommentToList(comment) {
  const container = document.getElementById("comments-container");

  // Remove "no comments" message if it exists
  const noData = container.querySelector(".no-data");
  if (noData) {
    noData.remove();
  }

  // Create comment element
  const commentDiv = document.createElement("div");
  commentDiv.className = "comment new-comment";
  commentDiv.setAttribute("data-comment-id", comment.CommentId);
  commentDiv.innerHTML = `
    <div class="comment-header">
      <strong class="comment-author">${comment.User.Username}</strong>
      <span class="comment-date">${new Date(
        comment.PublishedAt
      ).toLocaleString()}</span>
    </div>
    <div class="comment-content">
      ${comment.Content}
    </div>
  `;

  // Add to container
  container.appendChild(commentDiv);

  // Update count
  const currentCount = container.querySelectorAll(".comment").length;
  updateCommentCount(currentCount);

  // Scroll to new comment
  setTimeout(() => {
    commentDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 100);
}

// Setup comment form submission
function setupCommentForm() {
  const form = document.getElementById("comment-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userId = document.getElementById("userId").value;
    const content = document.getElementById("content").value;

    if (!userId || !content) {
      return;
    }

    try {
      // Post comment via REST API
      const response = await axios.post(
        `${API_BASE_URL}/articles/${ARTICLE_ID}/comments`,
        {
          UserId: parseInt(userId),
          Content: content,
        }
      );

      // Emit socket event to notify other users
      socket.emit("comment:created", {
        articleId: ARTICLE_ID,
        comment: response.data,
      });

      // Clear form
      form.reset();
    } catch (error) {
      console.error("Error posting comment:", error);
      if (error.response) {
        alert(
          `Error: ${error.response.data.message || "Failed to post comment"}`
        );
      } else {
        alert("Failed to post comment. Please try again.");
      }
    }
  });
}

// Setup Socket.IO listeners for real-time updates
function setupSocketListeners() {
  // Join the article-specific room
  socket.emit("join-article", ARTICLE_ID);

  // Listen for new comments from other users
  socket.on("comment:new", (comment) => {
    addCommentToList(comment);
  });

  // Handle errors
  socket.on("comment:error", (error) => {
    console.error("Socket error:", error);
    alert("Error: " + error.message);
  });

  // Connection status logging
  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
}

// Cleanup when leaving the page
window.addEventListener("beforeunload", () => {
  socket.emit("leave-article", ARTICLE_ID);
});

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
  setupCommentForm();
  setupSocketListeners();

  // Set initial comment count
  const container = document.getElementById("comments-container");
  if (container) {
    const commentCount = container.querySelectorAll(".comment").length;
    updateCommentCount(commentCount);
  }
});
