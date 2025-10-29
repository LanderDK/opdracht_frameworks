import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Article } from "./Article";

@Entity()
export class Blog {
  @PrimaryColumn()
  BlogId: number;

  @OneToOne(() => Article)
  @JoinColumn({ name: "BlogId" })
  article: Article;

  @Column()
  readtime: number; // in minutes
}
