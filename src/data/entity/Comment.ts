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

  @ManyToOne(() => Article, { onDelete: "CASCADE", eager: true })
  @JoinColumn({ name: "ArticleId" })
  ArticleId!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", eager: true })
  @JoinColumn({ name: "UserId" })
  UserId!: number;
}
