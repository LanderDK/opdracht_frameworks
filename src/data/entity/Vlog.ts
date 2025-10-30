import { ChildEntity, Column, OneToOne, JoinColumn } from "typeorm";
import { Article } from "./Article";
import { VideoFile } from "./VideoFile";

@ChildEntity("vlog")
export class Vlog extends Article {
  @Column({ nullable: true })
  VideoFileId: number;

  @OneToOne(() => VideoFile, { onDelete: "SET NULL" })
  @JoinColumn({ name: "VideoFileId" })
  VideoFile: VideoFile;
}
