import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ForeignKey,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from "typeorm";
import { Article } from "./Article";
import { VideoFile } from "./Videofile";

@Entity()
export class Vlog {
  @PrimaryColumn()
  VlogId: number;

  @OneToOne(() => Article, { cascade: true })
  @JoinColumn({ name: "VlogId" })
  article: Article;

  @Column()
  VideoFileId: number;

  @OneToOne(() => VideoFile, { cascade: true, lazy: true })
  @JoinColumn({ name: "VideoFileId" })
  videofile: VideoFile;
}
