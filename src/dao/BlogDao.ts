import { AppDataSource } from "../data-source";
import { Blog } from "../entity/Blog";
import { Article } from "../entity/Article";

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
    const repo = this.ds.getRepository(Blog);
    const blog = await repo.findOneBy({ BlogId: id });
    if (!blog) return false;    
    const res = await repo.remove(blog);
    return res !== undefined;
  }
}
