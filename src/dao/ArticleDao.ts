import { Repository, FindManyOptions } from "typeorm";
import AppDataSource from "../data/data-source";
import Article from "../data/entity/Article";

export default class ArticleDAO {
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
      .where("JSON_CONTAINS(article.Tags, :tagJson)", {
        tagJson: JSON.stringify([tag]),
      })
      .getMany();
  }

  async count(filter?: Partial<Article>): Promise<number> {
    return this.repo.count({ where: filter as any });
  }
}
