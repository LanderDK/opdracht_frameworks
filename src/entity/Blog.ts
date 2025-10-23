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
  @PrimaryColumn()
  BlogId: number;

  @OneToOne(() => Article, { cascade: true })
  @JoinColumn({ name: "BlogId" })
  article: Article;

  @Column()
  readtime: number; // in minutes
}
