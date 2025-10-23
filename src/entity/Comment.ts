import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Article } from "./Article";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  CommentId: number;

  @Column()
  Content: string;

  @Column()
  PublishedAt: Date;

  @ManyToOne(() => User, (user) => user.UserId, { cascade: true, eager: true })
  UserId: number;

  @ManyToOne(() => Article, (article) => article.ArticleId, {
    cascade: true,
    lazy: true,
  })
  ArticleId: number;
}
