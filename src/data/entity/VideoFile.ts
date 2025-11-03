import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Vlog from "./Vlog";

@Entity()
export default class VideoFile {
  @PrimaryGeneratedColumn()
  VideoFileId: number;

  @Column()
  VideoFileUrl: string;

  @OneToOne(() => Vlog, (vlog) => vlog.VideoFile)
  Vlog: Vlog;
}
