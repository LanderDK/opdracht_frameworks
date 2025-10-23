import { Entity, ManyToMany, ManyToOne } from "typeorm";
import { User } from "./User";
import { Article } from "./Article";

@Entity()
export class UserArticle {
  @ManyToOne(() => User, (user) => user.UserId)
  UserId: number;

  @ManyToOne(() => Article, (article) => article.ArticleId)
  ArticleId: number;
}