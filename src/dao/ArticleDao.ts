import { Repository, FindManyOptions } from "typeorm";
import { AppDataSource } from "../data/data-source";
import { Article } from "../data/entity/Article";

export class ArticleDAO {
  protected repo: Repository<Article>;

  constructor(protected ds = AppDataSource) {
    this.repo = this.ds.getRepository(Article);
  }

  async findAll(options?: FindManyOptions<Article>): Promise<Article[]> {
    return this.repo.find(options);
  }

  async findById(id: number): Promise<Article | null> {
    return this.repo.findOneBy({ ArticleId: id });
  }

  async findBySlug(slug: string): Promise<Article | null> {
    return this.repo.findOneBy({ Slug: slug });
  }

  /**
   * Find articles that contain the given tag (MySQL JSON column)
   */
  async findByTag(tag: string): Promise<Article[]> {
    return this.repo
      .createQueryBuilder("article")
      .where("JSON_CONTAINS(article.Tags, :tagJson)", { tagJson: JSON.stringify([tag]) })
      .getMany();
  }

  async create(payload: Partial<Article>): Promise<Article> {
    const article = this.repo.create(payload);
    article.PublishedAt = article.PublishedAt ?? new Date();
    return this.repo.save(article);
  }

  async update(id: number, patch: Partial<Article>): Promise<Article | null> {
    const article = await this.findById(id);
    if (!article) return null;
    article.UpdatedAt = new Date();
    this.repo.merge(article, patch);
    return this.repo.save(article);
  }

  async delete(id: number): Promise<boolean> {
    const res = await this.repo.delete(id);
    return (res.affected ?? 0) > 0;
  }

  async count(filter?: Partial<Article>): Promise<number> {
    return this.repo.count({ where: filter as any });
  }
}
