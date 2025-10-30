import {
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { User } from "./User";
import { Article } from "./Article";

@Entity()
export class UserArticle {
  @PrimaryColumn()
  ArticleId: number;

  @ManyToOne(() => Article, { cascade: false })
  @JoinColumn({ name: "ArticleId" })
  Article: Article;

  @PrimaryColumn()
  UserId: number;

  @ManyToOne(() => User, { cascade: false })
  @JoinColumn({ name: "UserId" })
  User: User;
}
