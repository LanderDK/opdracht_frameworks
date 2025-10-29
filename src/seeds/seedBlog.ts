import { AppDataSource } from "../data-source";
import { Blog } from "../entity/Blog";
import { Article } from "../entity/Article";
import * as faker from "faker";

/**
 * Seed Blog rows. Each Blog must reference an Article row with ArticleType = 'blog'.
 * If there are not enough Article rows, this function will create them first.
 * @param ensureCount how many blog articles to ensure exist (defaults to 5)
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

  // Get all articles with type 'blog'
  let blogArticles = await articleRepository.find({
    where: { ArticleType: "blog" },
  });

  // If there are fewer than ensureCount blog articles, create the missing ones
  if (blogArticles.length < ensureCount) {
    const toCreate = ensureCount - blogArticles.length;
    console.log(`Creating ${toCreate} missing blog Article(s)`);

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

    const newArticles: Partial<Article>[] = [];

    for (let i = 0; i < toCreate; i++) {
      const numTags = Math.floor(Math.random() * 4) + 2;
      const shuffledTags = [...availableTags].sort(() => Math.random() - 0.5);
      const tags: string[] = [];
      for (let j = 0; j < numTags && j < shuffledTags.length; j++) {
        tags.push(shuffledTags[j]);
      }

      const publishedAt = faker.date.past(1);
      const updatedAt = faker.date.between(publishedAt, new Date());

      newArticles.push({
        Excerpt: faker.lorem.sentence(),
        ArticleType: "blog",
        Slug: faker.helpers.slugify(faker.lorem.words(3)).toLowerCase(),
        Content: faker.lorem.paragraphs(3),
        Tags: tags,
        PublishedAt: publishedAt,
        UpdatedAt: updatedAt,
      });
    }

    const saved = await articleRepository.save(newArticles as Article[]);
    // merge saved articles with existing blogArticles
    blogArticles = blogArticles.concat(saved);
  }

  if (blogArticles.length === 0) {
    console.log("No blog articles found to create blogs");
    return [];
  }

  const blogs: Blog[] = [];

  for (const article of blogArticles) {
    const blog = new Blog();
    blog.BlogId = article.ArticleId;
    blog.article = article;
    // Random read time between 2 and 15 minutes
    blog.readtime = Math.floor(Math.random() * 14) + 2;
    blogs.push(blog);
  }

  await blogRepository.save(blogs);
  console.log(`✓ Seeded ${blogs.length} blogs`);
  return blogs;
}
