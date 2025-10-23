import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { config } from "dotenv";
import { Blog } from "./entity/Blog";
import { Article } from "./entity/Article";
import { VideoFile } from "./entity/VideoFile";
import { Vlog } from "./entity/Vlog";
import { Comment } from "./entity/Comment";
import { UserArticle } from "./entity/UserArticle";

config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: true,
    logging: false,
    entities: [User, Article, Blog, VideoFile, Vlog, Comment, UserArticle],
    migrations: [],
    subscribers: [],
})
