import { DataSource, Repository, FindManyOptions } from "typeorm";
import { Article } from "../entity/Article";


export class ArticleDAO {
  private repo: Repository<Article>;
  
  //Initialise the repository to query towards
  constructor(private dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(Article);
  }

  // GetAll
  async getAll(): Promise<Article[]> {
    return this.repo.find();
  }

  // GetById
  async getById(id: number): Promise<Article | null> {
    return this.repo.findOneBy({ ArticleId: id });
  }

  //GetBySlug
  async getBySlug(slug: string): Promise<Article | null> {
    return this.repo.findOneBy({ Slug: slug });
  }

  //FilterByTag
  async filterByTag(tag: string): Promise<Article[]> {
    return this.repo.createQueryBuilder("Article").where("JSON_CONTAINS(article.Tags, :tagJson)", { tagJson: JSON.stringify([tag]) }).getMany();;
  }

  // Create
  async create(articleData: Partial<Article>): Promise<Article> {
    const article = this.repo.create(articleData);
    article.PublishedAt = new Date();
    return this.repo.save(article);
  }

  // Update
  async update(id: number, articleData: Partial<Article>): Promise<Article | null> {
    const article = await this.repo.findOneBy({ ArticleId: id });
    if (!article) {
      return null;
    }
    article.UpdatedAt = new Date();
    this.repo.merge(article, articleData);
    return this.repo.save(article);
  }

  // Delete
  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected !== 0;
  }
}