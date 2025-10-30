import { AppDataSource } from "../data/data-source";
import { Blog } from "../data/entity/Blog";
import { Article } from "../data/entity/Article";

export class BlogDAO {
  constructor(protected ds = AppDataSource) {}

  async findAll(): Promise<Blog[]> {
    return this.ds.getRepository(Blog).find();
  }

  async findById(id: number): Promise<Blog | null> {
    return this.ds.getRepository(Blog).findOne({ where: { ArticleId: id }});
  }

  async create(payload: Partial<Blog>): Promise<Blog> {
    const repo = this.ds.getRepository(Blog);
    const blog = repo.create(payload);
    blog.PublishedAt = blog.PublishedAt ?? new Date();
    // TypeORM will automatically create both Article and Blog rows
    return repo.save(blog);
  }

  async update(id: number, patch: Partial<Blog>): Promise<Blog | null> {
    const repo = this.ds.getRepository(Blog);
    const blog = await repo.findOneBy({ ArticleId: id });
    if (!blog) return null;
    blog.UpdatedAt = new Date();
    repo.merge(blog, patch);
    return repo.save(blog);
  }

  async delete(id: number): Promise<boolean> {
    const repo = this.ds.getRepository(Blog);
    const blog = await repo.findOneBy({ ArticleId: id });
    if (!blog) return false;
    // TypeORM will handle cascade delete for child table rows
    await repo.remove(blog);
    return true;
  }
}
