import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { Server } from "http";
import { installRestRoutes } from "./routes";
import { initializeLogger, getLogger } from "./core/logging";
import { ServiceError } from "./core/serviceError";
import emoji from "node-emoji";
import { initializeData, shutdownData } from "./data";

// Configuration
const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT;
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(",");
const CORS_MAX_AGE = parseInt(process.env.CORS_MAX_AGE, 10);
const LOG_LEVEL = process.env.NODE_ENV === "production" ? "info" : "debug";
const LOG_DISABLED = false;

export default async function createServer() {
  // Initialize logger first
  initializeLogger({
    level: LOG_LEVEL,
    disabled: LOG_DISABLED,
    defaultMeta: {
      NODE_ENV,
    },
  });
  const logger = getLogger();

  // Initialize database
  await initializeData();

  const app: Application = express();
  let server: Server | null = null;

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin
        if (!origin) return callback(null, true);

        // Check whitelist
        if (CORS_ORIGINS && CORS_ORIGINS.includes(origin)) {
          logger.debug(`CORS: Allowed origin ${origin}`);
          callback(null, true);
        } else {
          logger.warn(`CORS: Rejected origin ${origin}`);
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      allowedHeaders: ["Accept", "Content-Type", "Authorization"],
      maxAge: CORS_MAX_AGE,
    })
  );

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const logger = getLogger();
    logger.info(`${emoji.get("fast_forward")} ${req.method} ${req.url}`);

    const getStatusEmoji = () => {
      if (res.statusCode >= 500) return emoji.get("skull");
      if (res.statusCode >= 400) return emoji.get("x");
      if (res.statusCode >= 300) return emoji.get("rocket");
      if (res.statusCode >= 200) return emoji.get("white_check_mark");
      return emoji.get("rewind");
    };

    // Log response
    res.on("finish", () => {
      logger.info(
        `${getStatusEmoji()} ${req.method} ${res.statusCode} ${req.url}`
      );
    });

    next();
  });

  // Install REST routes
  installRestRoutes(app);

  // 404 handler - must be after all routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
      code: "NOT_FOUND",
      message: `Unknown resource: ${req.url}`,
    });
  });

  // Global error handler - must be last
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    logger.error("Error occurred while handling a request", {
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
      },
    });

    let statusCode = error.statusCode || error.status || 500;
    let errorBody: any = {
      code: error.code || "INTERNAL_SERVER_ERROR",
      message: error.message,
      details: error.details || {},
      stack: NODE_ENV !== "production" ? error.stack : undefined,
    };

    if (error instanceof ServiceError) {
      statusCode = error.statusCode;
    }

    // Handle JWT errors (if you're using JWT)
    if ((req as any).jwtOriginalError) {
      statusCode = 401;
      errorBody.code = "UNAUTHORIZED";
      errorBody.message = (req as any).jwtOriginalError.message;
      errorBody.details.jwtOriginalError = {
        message: (req as any).jwtOriginalError.message,
      };
    }

    res.status(statusCode).json(errorBody);
  });

  return {
    getApp(): Application {
      return app;
    },

    start(): Promise<void> {
      return new Promise((resolve) => {
        server = app.listen(PORT, () => {
          logger.info(`🚀 Server listening on http://localhost:${PORT}`);
          resolve();
        });
      });
    },

    async stop(): Promise<void> {
      if (server) {
        await new Promise<void>((resolve, reject) => {
          server!.close((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      await shutdownData();
      logger.info("Goodbye");
    },
  };
}
