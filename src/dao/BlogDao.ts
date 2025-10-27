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

  /**
   * Create a blog: create Article row first, then Blog row that re-uses the ArticleId as BlogId
   * payload.article can be used to pass article fields (Excerpt, Content, Tags, ...)
   */
  async create(payload: Partial<Blog> & { article?: Partial<Article> }): Promise<Blog> {
    return this.ds.manager.transaction(async (manager) => {
      const articleRepo = manager.getRepository(Article);
      const blogRepo = manager.getRepository(Blog);

      const articlePayload = payload.article ?? {};
      const article = articleRepo.create(articlePayload);
      article.PublishedAt = article.PublishedAt ?? new Date();
      const savedArticle = await articleRepo.save(article);

      const blog = blogRepo.create({ ...payload, BlogId: savedArticle.ArticleId });
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
    const res = await this.ds.getRepository(Blog).delete(id);
    return (res.affected ?? 0) > 0;
  }
}
