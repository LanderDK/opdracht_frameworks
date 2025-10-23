import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  UserId: number;

  @Column()
  Username: string;

  @Column("json")
  Roles: string[];

  @Column()
  Email: string;
}
