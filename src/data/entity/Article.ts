import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
} from "typeorm";
import ArticleType from "../enum/ArticleType";

@Entity()
@TableInheritance({ column: { type: "varchar", name: "ArticleType" } })
export default class Article {
  @PrimaryGeneratedColumn()
  ArticleId: number;

  @Column({ length: 256 })
  Title: string;

  @Column({ length: 1024 })
  Excerpt: string;

  @Column({ length: 8192 })
  Content: string;

  @Column({ length: 128 })
  Slug: string;

  @Column("json")
  Tags: string[];

  @Column()
  PublishedAt: Date;

  @Column()
  UpdatedAt: Date;

  @Column({
    type: "enum",
    enum: ArticleType,
  })
  ArticleType: ArticleType;
}
