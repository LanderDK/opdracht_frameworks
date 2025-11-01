import { ChildEntity, Column } from "typeorm";
import { Article } from "./Article";

@ChildEntity()
export class Blog extends Article {
  @Column()
  Readtime: number;
}
