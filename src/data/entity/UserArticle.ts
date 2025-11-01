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

  @ManyToOne(() => Article, { cascade: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "ArticleId" })
  Article: Article;

  @PrimaryColumn()
  UserId: number;

  @ManyToOne(() => User, { cascade: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "UserId" })
  User: User;
}
