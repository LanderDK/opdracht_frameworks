import { Application, Router } from "express";
import installArticleRouter from "./article";
import installBlogRouter from "./blog";
import installVlogRouter from "./vlog";
import installCommentRouter from "./comment";
import installUserRouter from "./user";

export default function installRestRoutes(app: Application): void {
  // Create a single router with /api prefix
  const router = Router();

  // Install all route modules
  installArticleRouter(router);
  installBlogRouter(router);
  installVlogRouter(router);
  installCommentRouter(router);
  installUserRouter(router);

  // Mount the router with the /api prefix
  app.use("/api", router);
}
