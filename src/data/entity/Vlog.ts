import { Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Article } from "./Article";
import { VideoFile } from "./VideoFile";

@Entity()
export class Vlog {
  @PrimaryColumn()
  ArticleId: number;

  @OneToOne(() => Article, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "ArticleId" })
  Article: Article;

  @OneToOne(() => VideoFile, { lazy: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "VideoFileId" })
  VideoFile: VideoFile;
}
