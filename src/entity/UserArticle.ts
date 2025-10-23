import { Entity, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Article } from "./Article";

@Entity()
export class UserArticle {
  @ManyToOne(() => User, (user) => user.UserId, { cascade: false })
  @PrimaryColumn()
  UserId: number;
  
  @ManyToOne(() => Article, (article) => article.ArticleId, { cascade: false })
  @PrimaryColumn()
  ArticleId: number;
}
