import { Server as SocketIOServer, Socket } from "socket.io";
import { getLogger } from "../core/logging";

export function initializeWebSocket(io: SocketIOServer) {
  const logger = getLogger();

  io.on("connection", (socket: Socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Join a room for a specific article
    socket.on("join-article", (articleId: number) => {
      const room = `article-${articleId}`;
      socket.join(room);
      logger.info(`Client ${socket.id} joined room ${room}`);
    });

    // Leave a room for a specific article
    socket.on("leave-article", (articleId: number) => {
      const room = `article-${articleId}`;
      socket.leave(room);
      logger.info(`Client ${socket.id} left room ${room}`);
    });

    // Handle new comment event - broadcast comment that was created via REST API
    socket.on("comment:created", (data: { comment: any }) => {
      try {
        logger.info(
          `Broadcasting new comment from client ${socket.id}`,
          data.comment
        );

        // Get article ID from the comment
        const articleId = data.comment.ArticleId;
        const room = `article-${articleId}`;

        // Broadcast to all clients in the article room (including sender)
        io.to(room).emit("comment:new", data.comment);

        logger.info(
          `Comment broadcasted to room ${room}, number of clients in room: ${
            io.sockets.adapter.rooms.get(room)?.size || 0
          }`
        );
      } catch (error) {
        logger.error("Error broadcasting comment via socket", error);
        socket.emit("comment:error", {
          message: "Failed to broadcast comment",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
}

export function getIO(io: SocketIOServer | null) {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}
