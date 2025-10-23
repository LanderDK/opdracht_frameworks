import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
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


  @Column()
  UserId: number;

  @ManyToOne(() => User, { cascade: true, eager: true })
  @JoinColumn({ name: "UserId" })
  user: User;

  @Column()
  ArticleId: number;

  @ManyToOne(() => Article, { cascade: true, eager: true })
  @JoinColumn({ name: "ArticleId" })
  article: Article;
}
