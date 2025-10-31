import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Article } from "./Article";

@Entity()
export class Blog {
  @PrimaryColumn()
  ArticleId: number;

  @OneToOne(() => Article, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "ArticleId" })
  Article!: Article;

  @Column()
  Readtime: number;
}
