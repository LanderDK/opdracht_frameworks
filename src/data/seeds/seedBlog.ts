import AppDataSource from "../data-source";
import Blog from "../entity/Blog";
import * as faker from "faker";
import ArticleType from "../enum/ArticleType";

/**
 * Seed Blog rows using TypeORM Single Table Inheritance.
 * TypeORM will create rows in the Article table with ArticleType='BLOG'.
 * @param ensureCount how many blogs to create (defaults to 5)
 */
export default async function seedBlogs(ensureCount: number = 5): Promise<Blog[]> {
  const blogRepository = AppDataSource.getRepository(Blog);
  const userArticleRepository = AppDataSource.getRepository("UserArticle");
  // Check if blogs already exist
  const existingCount = await blogRepository.count();
  if (existingCount > 0) {
    console.log(
      `Blogs already seeded (${existingCount} blogs found). Skipping...`
    );
    return await blogRepository.find();
  }

  console.log(
    `Creating ${ensureCount} blog(s) with TypeORM Single Table Inheritance...`
  );

  const availableTags = [
    "technology",
    "programming",
    "javascript",
    "typescript",
    "database",
    "tutorial",
    "news",
    "opinion",
    "review",
    "beginner",
    "advanced",
  ];

  const blogs: Blog[] = [];

  for (let i = 0; i < ensureCount; i++) {
    const numTags = Math.floor(Math.random() * 4) + 2;
    const shuffledTags = [...availableTags].sort(() => Math.random() - 0.5);
    const tags: string[] = [];
    for (let j = 0; j < numTags && j < shuffledTags.length; j++) {
      tags.push(shuffledTags[j]);
    }

    const userids = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () =>
      Math.floor(Math.random() * 5) + 1
    );

    const publishedAt = faker.date.past(1);
    const updatedAt = faker.date.between(publishedAt, new Date());

    // Create Blog directly - inherits Article properties
    const blog = new Blog();
    blog.Title = faker.lorem.sentence();
    blog.Excerpt = faker.lorem.sentence();
    blog.Slug = faker.helpers.slugify(faker.lorem.words(3)).toLowerCase();
    blog.Content = faker.lorem.paragraphs(3);
    blog.Tags = tags;
    blog.PublishedAt = publishedAt;
    blog.UpdatedAt = updatedAt;
    blog.ArticleType = ArticleType.BLOG;
    blog.Readtime = Math.floor(Math.random() * 14) + 2;

    blogs.push(blog);
  }

  await blogRepository.save(blogs);
  console.log(`✓ Seeded ${blogs.length} blogs`);

  for (const blog of blogs) {
    const count = Math.floor(Math.random() * 3) + 1; // 1..3
    const useridsSet = new Set<number>();
    while (useridsSet.size < count) {
      useridsSet.add(Math.floor(Math.random() * 5) + 1); // 1..5
    }
    const articleid = blog.ArticleId;
    for (const userid of useridsSet) {
      await userArticleRepository.save({
        UserId: userid,
        ArticleId: articleid,
      });
    }
  }

  return blogs;
}
