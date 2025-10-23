import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  ArticleId: number;

  @Column()
  Excerpt: string;

  @Column()
  ArticleType: string;

  @Column()
  Slug: string;

  @Column()
  Content: string;

    @Column("json")
    Tags: string[]

  @Column()
  PublishedAt: Date;

  @Column()
  UpdatedAt: Date;
}
