import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ForeignKey,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Article } from "./Article";
import { VideoFile } from "./VideoFile";

@Entity()
export class Vlog {
  @OneToOne(() => Article, (article) => article.ArticleId, { cascade: true })
  @JoinColumn()
  VlogId: number;

  @OneToOne(() => VideoFile, (videoFile) => videoFile.VideoFileId, {
    cascade: true,
    lazy: true,
  })
  @JoinColumn()
  VideoFileId: number;
}
