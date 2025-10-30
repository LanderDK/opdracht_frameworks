import { AppDataSource } from "./data/data-source";
import { ArticleDAO } from "./dao/ArticleDao";
import { BlogDAO } from "./dao/BlogDao";
import process from "process";

/**
 * Debug/Test harness for Blog DAO
 * Tests the complete lifecycle: create, read, update, delete (with cascade)
 */
async function main() {
  console.log("=".repeat(60));
  console.log("🔧 Blog DAO Debug/Test Harness");
  console.log("=".repeat(60));

  try {
    console.log("\n[1/7] Initializing DataSource...");
    await AppDataSource.initialize();
    console.log("✓ DataSource initialized\n");

    const articleDao = new ArticleDAO();
    const blogDao = new BlogDAO();

    // TEST 1: Create a Blog (TypeORM will create Article + Blog rows)
    console.log("=".repeat(60));
    console.log("[2/7] TEST: Create Blog with TypeORM Inheritance");
    console.log("=".repeat(60));
    const blog = await blogDao.create({
      Excerpt: "Test blog excerpt - debugging DAO operations with inheritance",
      Content: "This is a test blog created by the debug harness to verify TypeORM inheritance works correctly.",
      Slug: `debug-blog-${Date.now()}`,
      Tags: ["debug", "test", "dao", "inheritance"],
      Readtime: 5,
    });
    console.log("✓ Blog created:");
    console.log(`  ArticleId: ${blog.ArticleId}`);
    console.log(`  Readtime: ${blog.Readtime} min`);
    console.log(`  Slug: ${blog.Slug}`);

    // TEST 2: Read - Find by ID
    console.log("\n" + "=".repeat(60));
    console.log("[3/7] TEST: Find Blog by ID");
    console.log("=".repeat(60));
    const foundBlog = await blogDao.findById(blog.ArticleId);
    console.log(foundBlog ? "✓ Blog found:" : "✗ Blog NOT found");
    if (foundBlog) {
      console.log(`  ArticleId: ${foundBlog.ArticleId}, Readtime: ${foundBlog.Readtime} min`);
    }

    // TEST 3: Verify Article row exists in article table
    console.log("\n" + "=".repeat(60));
    console.log("[4/7] TEST: Verify Article base row exists");
    console.log("=".repeat(60));
    const articleBeforeDelete = await articleDao.findById(blog.ArticleId);
    console.log(articleBeforeDelete ? "✓ Article exists:" : "✗ Article NOT found");
    if (articleBeforeDelete) {
      console.log(`  ArticleId: ${articleBeforeDelete.ArticleId}`);
      console.log(`  Excerpt: ${articleBeforeDelete.Excerpt}`);
      console.log(`  Slug: ${articleBeforeDelete.Slug}`);
    }

    // TEST 4: Update Blog
    console.log("\n" + "=".repeat(60));
    console.log("[5/7] TEST: Update Blog Readtime");
    console.log("=".repeat(60));
    const updatedBlog = await blogDao.update(blog.ArticleId, { Readtime: 10 });
    console.log(updatedBlog ? "✓ Blog updated:" : "✗ Update failed");
    if (updatedBlog) {
      console.log(`  New Readtime: ${updatedBlog.Readtime} min`);
    }

    // TEST 5: Delete Blog (should CASCADE delete Article via TypeORM inheritance)
    console.log("\n" + "=".repeat(60));
    console.log("[6/7] TEST: Delete Blog (should cascade to Article)");
    console.log("=".repeat(60));
    const deleted = await blogDao.delete(blog.ArticleId);
    console.log(deleted ? "✓ Blog deleted" : "✗ Delete failed");

    // TEST 6: Verify Article is also deleted (cascade)
    console.log("\n" + "=".repeat(60));
    console.log("[7/7] TEST: Verify Article was CASCADE deleted");
    console.log("=".repeat(60));
    const articleAfterDelete = await articleDao.findById(blog.ArticleId);
    if (!articleAfterDelete) {
      console.log("✓ Article successfully deleted (cascade worked!)");
    } else {
      console.log("✗ Article still exists (cascade FAILED)");
      console.log(`  ArticleId: ${articleAfterDelete.ArticleId}`);
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 Summary");
    console.log("=".repeat(60));
    const allBlogs = await blogDao.findAll();
    const allArticles = await articleDao.findAll();
    console.log(`Total Blogs: ${allBlogs.length}`);
    console.log(`Total Articles: ${allArticles.length}`);

    console.log("\n✓ Debug harness completed successfully!");
  } catch (err) {
    console.error("\n❌ Error during debug/test:", err);
    process.exit(-1);
  } finally {
    try {
      await AppDataSource.destroy();
      console.log("\n✓ DataSource closed");
    } catch (__) {
      // ignore
    }
  }
}

main();
