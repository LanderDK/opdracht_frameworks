import { Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Article } from "./Article";
import { VideoFile } from "./VideoFile";

@Entity()
export class Vlog {
  @PrimaryColumn()
  ArticleId: number;

  @OneToOne(() => Article, { cascade: true, eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: "ArticleId" })
  Article!: Article;

  @OneToOne(() => VideoFile, { cascade: true, eager: true })
  @JoinColumn({ name: "VideoFileId" })
  VideoFile!: VideoFile;
}