import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Article } from "./Article";
import { VideoFile } from "./VideoFile";

@Entity()
export class Vlog {
  @PrimaryColumn()
  VlogId: number;

  @OneToOne(() => Article)
  @JoinColumn({ name: "VlogId" })
  article: Article;

  @Column({ nullable: true })
  VideoFileId: number;

  @OneToOne(() => VideoFile)
  @JoinColumn({ name: "VideoFileId" })
  videofile: VideoFile;
}
