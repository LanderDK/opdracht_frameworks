import { Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Article } from "./Article";

@Entity()
export class UserArticle {

  @PrimaryColumn()
  ArticleId: number;

  @ManyToOne(() => Article, { cascade: true })
  @JoinColumn({ name: "ArticleId" })
  article: Article;

  @PrimaryColumn()
  UserId: number;

  @ManyToOne(() => User, { cascade: true })
  @JoinColumn({ name: "UserId" })
  user: User;
}
