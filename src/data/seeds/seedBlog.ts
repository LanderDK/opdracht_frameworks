import { AppDataSource } from "../data-source";
import { Article } from "../entity/Article";
import { Blog } from "../entity/Blog";
import * as faker from "faker";

/**
 * Seed Blog rows using TypeORM Class-Table Inheritance.
 * TypeORM will automatically create both Article and Blog table rows.
 * @param ensureCount how many blogs to create (defaults to 5)
 */
export async function seedBlogs(ensureCount: number = 5): Promise<Blog[]> {
  const blogRepository = AppDataSource.getRepository(Blog);
  const articleRepository = AppDataSource.getRepository(Article);

  // Check if blogs already exist
  const existingCount = await blogRepository.count();
  if (existingCount > 0) {
    console.log(
      `Blogs already seeded (${existingCount} blogs found). Skipping...`
    );
    return await blogRepository.find();
  }

  console.log(`Creating ${ensureCount} blog(s) with TypeORM inheritance...`);

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

    const publishedAt = faker.date.past(1);
    const updatedAt = faker.date.between(publishedAt, new Date());

    // Create Blog directly - TypeORM will create both Article and Blog rows
    const blog = new Blog();
    blog.Article = new Article();
    blog.Article.Excerpt = faker.lorem.sentence();
    blog.Article.Slug = faker.helpers.slugify(faker.lorem.words(3)).toLowerCase();
    blog.Article.Content = faker.lorem.paragraphs(3);
    blog.Article.Tags = tags;
    blog.Article.Title = faker.lorem.sentence();
    blog.Article.PublishedAt = publishedAt;
    blog.Article.UpdatedAt = updatedAt;
    blog.Readtime = Math.floor(Math.random() * 14) + 2;
    blog.Article.ArticleType = "Blog";
    blogs.push(blog);
    await articleRepository.save(blog.Article);
  }
  await blogRepository.save(blogs);
  console.log(`✓ Seeded ${blogs.length} blogs`);
  return blogs;
}
