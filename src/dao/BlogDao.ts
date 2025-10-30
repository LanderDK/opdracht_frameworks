import { AppDataSource } from "../data/data-source";
import { Blog } from "../data/entity/Blog";
import { Article } from "../data/entity/Article";

export class BlogDAO {
  constructor(protected ds = AppDataSource) {}

  async findAll(): Promise<Blog[]> {
    return this.ds.getRepository(Blog).find();
  }

  async findById(id: number): Promise<Blog | null> {
    return this.ds.getRepository(Blog).findOne({ where: { BlogId: id }});
  }

  async create(payload: Partial<Blog> & { article?: Partial<Article> }): Promise<Blog> {
    return this.ds.manager.transaction(async (manager) => {
      const articleRepo = manager.getRepository(Article);
      const blogRepo = manager.getRepository(Blog);

      // Step 1: Create and save the Article first
      const articlePayload = payload.article ?? {};
      const article = articleRepo.create(articlePayload);
      article.PublishedAt = article.PublishedAt ?? new Date();
      const savedArticle = await articleRepo.save(article);

      if (!savedArticle?.ArticleId) {
        throw new Error("Article creation failed: no ArticleId returned");
      }

      // Step 2: Create Blog with BlogId = ArticleId and set the relation
      const blog = blogRepo.create({ ...payload });
      blog.BlogId = savedArticle.ArticleId;
      blog.article = savedArticle;

      return blogRepo.save(blog);
    });
  }

  async update(id: number, patch: Partial<Blog>): Promise<Blog | null> {
    const repo = this.ds.getRepository(Blog);
    const blog = await repo.findOneBy({ BlogId: id });
    if (!blog) return null;
    repo.merge(blog, patch);
    return repo.save(blog);
  }
  
  async delete(id: number): Promise<boolean> {
    return this.ds.manager.transaction(async (manager) => {
      const blogRepo = manager.getRepository(Blog);
      const articleRepo = manager.getRepository(Article);

      // Find the blog with its article relation
      const blog = await blogRepo.findOne({ 
        where: { BlogId: id },
        relations: ["article"]
      });
      
      if (!blog) return false;

      // Delete blog first (to avoid FK constraint violation)
      await blogRepo.remove(blog);

      // Then delete the linked article if it exists
      if (blog.article) {
        await articleRepo.remove(blog.article);
      }

      return true;
    });
  }
}
