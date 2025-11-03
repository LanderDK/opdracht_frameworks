import { ChildEntity, Column } from "typeorm";
import Article from "./Article";

@ChildEntity()
export default class Blog extends Article {
  @Column()
  Readtime: number;
}
