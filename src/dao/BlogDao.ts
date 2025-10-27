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
      const blogRepo = manager.getRepository(Blog);
      const blog = blogRepo.create({ ...payload, BlogId: payload.ArticleId });
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
