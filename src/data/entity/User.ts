import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  UserId: number;

  @Column({ length: 255 })
  Username: string;

  @Column({ length: 255 })
  Email: string;

  @Column("json")
  Roles: string[];
}
