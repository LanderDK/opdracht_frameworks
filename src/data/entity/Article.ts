import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Article {
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

  @Column()
  ArticleType: string;
}
