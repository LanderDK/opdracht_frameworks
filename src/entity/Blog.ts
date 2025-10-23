import { Entity, PrimaryGeneratedColumn, Column, ForeignKey, OneToOne, JoinColumn } from "typeorm"
import { Article } from "./Article"

@Entity()
export class Blog{
  @OneToOne(() => Article, (article) => article.ArticleId)
  @JoinColumn()
  BlogId: number

  @Column()
  readtime: number // in minutes
}