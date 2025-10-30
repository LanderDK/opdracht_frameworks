import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class VideoFile {
  @PrimaryGeneratedColumn()
  VideoFileId: number;

  @Column()
  VideoFileUrl: string;
}