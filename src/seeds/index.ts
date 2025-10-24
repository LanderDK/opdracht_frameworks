import "reflect-metadata";
import { AppDataSource } from "../data-source";
import { seedUsers } from "./seedUser";
import { seedArticles } from "./seedArticle";
import { seedBlogs } from "./seedBlog";
import { seedVideoFiles } from "./seedVideoFile";
import { seedVlogs } from "./seedVlog";
import { seedComments } from "./seedComment";
import { seedUserArticles } from "./seedUserArticle";

async function runSeeds() {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Initialize database connection
    await AppDataSource.initialize();
    console.log("✓ Database connection established\n");

    // Seed in the correct order to respect relationships
    await seedUsers(3);
    //await seedArticles(5);
    await seedVideoFiles(5);
    await seedBlogs();
    await seedVlogs();
    await seedComments(10);
    await seedUserArticles(10);

    console.log("\n✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("\n✓ Database connection closed");
    }
  }
}

// Run the seeds
runSeeds();
