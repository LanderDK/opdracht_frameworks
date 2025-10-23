import { AppDataSource } from "../data-source";
import { Blog } from "../entity/Blog";
import { Article } from "../entity/Article";

export async function seedBlogs(): Promise<Blog[]> {
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
  const blogArticles = await articleRepository.find({
    where: { ArticleType: "blog" },
  });

  if (blogArticles.length === 0) {
    console.log("No blog articles found to create blogs");
    return [];
  }

  const blogs: Blog[] = [];

  for (const article of blogArticles) {
    const blog = new Blog();
    blog.BlogId = article.ArticleId;
    // Random read time between 2 and 15 minutes
    blog.readtime = Math.floor(Math.random() * 14) + 2;
    blogs.push(blog);
  }

  await blogRepository.save(blogs);
  console.log(`✓ Seeded ${blogs.length} blogs`);
  return blogs;
}
