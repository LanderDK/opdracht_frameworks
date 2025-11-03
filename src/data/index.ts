import AppDataSource from "./data-source";
import { getLogger } from "../core/logging";

// Initialize TypeORM DataSource
async function initializeData() {
  const logger = getLogger();
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info("Database connection initialized");
    }
  } catch (error) {
    logger.error("Failed to initialize database", { error });
    throw error;
  }
}

// Shutdown TypeORM DataSource
async function shutdownData() {
  const logger = getLogger();
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info("Database connection closed");
    }
  } catch (error) {
    logger.error("Error closing database connection", { error });
  }
}

export { initializeData, shutdownData };
