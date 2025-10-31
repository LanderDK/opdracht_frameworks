import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Article } from "./Article";
import { VideoFile } from "./VideoFile";

@Entity()
export class Vlog {
  @PrimaryColumn()
  ArticleId: number;

  @Column()
  VideoFileId: number;

  @OneToOne(() => Article, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "ArticleId" })
  Article: Article;


  //Ophalen met await vlog.VideoFile
  @OneToOne(() => VideoFile, { lazy: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "VideoFileId" })
  VideoFile: VideoFile;
}
