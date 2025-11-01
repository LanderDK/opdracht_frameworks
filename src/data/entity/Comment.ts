import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Article } from "./Article";
import { User } from "./User";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  CommentId: number;

  @Column({ length: 8192 })
  Content: string;

  @Column()
  PublishedAt: Date;

  @Column()
  ArticleId: number;

  @Column()
  UserId: number;

  @ManyToOne(() => Article, { onDelete: "CASCADE", lazy: true })
  @JoinColumn({ name: "ArticleId" })
  Article: Article;

  @ManyToOne(() => User, { onDelete: "CASCADE", eager: true })
  @JoinColumn({ name: "UserId" })
  User: User;
}
