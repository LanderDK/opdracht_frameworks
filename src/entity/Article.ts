import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  ArticleId: number;

  @Column()
  Excerpt: string;

  @Column()
  ArticleType: string;

  @Column({ length: 2048 })
  Slug: string;

  @Column({ length: 8192 })
  Content: string;

    @Column("json")
    Tags: string[]

  @Column()
  PublishedAt: Date;

  @Column()
  UpdatedAt: Date;
}
