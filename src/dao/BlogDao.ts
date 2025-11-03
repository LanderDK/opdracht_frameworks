import AppDataSource from "../data/data-source";
import Blog from "../data/entity/Blog";
import { FindManyOptions, Repository } from "typeorm";
import ArticleType from "../data/enum/ArticleType";

export default class BlogDAO {
  protected repo: Repository<Blog>;

  constructor(protected ds = AppDataSource) {
    this.repo = this.ds.getRepository(Blog);
  }

  async findAll(options?: FindManyOptions<Blog>): Promise<Blog[]> {
    return this.repo.find(options);
  }

  async findById(id: number): Promise<Blog | null> {
    return this.repo.findOne({ where: { ArticleId: id } });
  }

  async create(payload: Partial<Blog>): Promise<Blog> {
    // With Single Table Inheritance, Blog extends Article
    // So we can set Article properties directly on Blog
    const blog = this.repo.create({
      ...payload,
      ArticleType: ArticleType.BLOG,
      PublishedAt: payload.PublishedAt ?? new Date(),
      UpdatedAt: payload.UpdatedAt ?? new Date(),
    });

    return this.repo.save(blog);
  }

  async createBulk(blogsData: Partial<Blog>[]): Promise<Blog[]> {
    const blogs = this.repo.create(
      blogsData.map((blogData) => ({
        ...blogData,
        ArticleType: ArticleType.BLOG,
        PublishedAt: blogData.PublishedAt ?? new Date(),
        UpdatedAt: blogData.UpdatedAt ?? new Date(),
      }))
    );
    return this.repo.save(blogs);
  }

  async update(id: number, patch: Partial<Blog>): Promise<Blog | null> {
    const blog = await this.repo.findOne({ where: { ArticleId: id } });

    if (!blog) return null;

    // Update properties directly (Blog extends Article)
    Object.assign(blog, patch);
    blog.UpdatedAt = new Date();

    return this.repo.save(blog);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete({ ArticleId: id });
    return result.affected !== 0;
  }
}
