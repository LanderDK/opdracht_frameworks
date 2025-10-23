import {
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Column,
  ForeignKey,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Article } from "./Article";

@Entity()
export class Blog {
  @OneToOne(() => Article, (article) => article.ArticleId, { cascade: true })
  @PrimaryColumn()
  @JoinColumn()
  BlogId: number;

  @Column()
  readtime: number; // in minutes
}
