import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class VideoFile {
  @PrimaryGeneratedColumn()
  VideoFileId: number;

  @Column()
  VideoFileUrl: string;
}
