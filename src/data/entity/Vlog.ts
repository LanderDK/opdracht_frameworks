import { ChildEntity, Column, JoinColumn, OneToOne } from "typeorm";
import { Article } from "./Article";
import { VideoFile } from "./VideoFile";

@ChildEntity()
export class Vlog extends Article {
  @Column()
  VideoFileId: number;

  //Ophalen met await vlog.VideoFile
  @OneToOne(() => VideoFile, { lazy: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "VideoFileId" })
  VideoFile: VideoFile;
}
