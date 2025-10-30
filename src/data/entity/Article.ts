import { Entity, PrimaryGeneratedColumn, Column, TableInheritance } from "typeorm";

@Entity()
@TableInheritance({ column: { type: "varchar", name: "ArticleType" } })
export abstract class Article {
  @PrimaryGeneratedColumn()
  ArticleId: number;

  @Column()
  Title: string;

  @Column()
  Excerpt: string;

  @Column({ length: 2048 })
  Slug: string;

  @Column({ length: 8192 })
  Content: string;

  @Column("json")
  Tags: string[];

  @Column()
  PublishedAt: Date;

  @Column({ nullable: true })
  UpdatedAt: Date;
}
