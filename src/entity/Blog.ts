import { ChildEntity, Column } from "typeorm";
import { Article } from "./Article";

@ChildEntity("blog")
export class Blog extends Article {
  @Column()
  Readtime: number; // in minutes
}
