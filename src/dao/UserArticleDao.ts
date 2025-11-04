import { Repository } from "typeorm";
import AppDataSource from "../data/data-source";
import UserArticle from "../data/entity/UserArticle";
import UserDAO from "./UserDao";

export class UserArticleDAO {

  protected repo: Repository<UserArticle>;
  protected userDao: UserDAO = new UserDAO();

  constructor(protected ds = AppDataSource) {
    this.repo = this.ds.getRepository(UserArticle);
  }

  async findAuthorsByArticleId(articleId: number): Promise<string[]> {

    const rows = await AppDataSource.getRepository(UserArticle)
    .createQueryBuilder("ua")
    .select("ua.UserId", "UserId")
    .where("ua.ArticleId = :articleId", { articleId: articleId })
    .getRawMany();

    const userNames = await Promise.all(rows.map(async r => (await this.userDao.findById(Number(r.UserId))).Username));
    return userNames
  }

  async create(payload: Partial<UserArticle>): Promise<UserArticle> {
    const userArticle = this.repo.create(payload);
    return this.repo.save(userArticle);
  }

}
