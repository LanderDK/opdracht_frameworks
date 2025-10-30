import { Router, Request, Response, NextFunction } from "express";
import { ArticleDAO } from "../dao/ArticleDao";

const articleDao = new ArticleDAO();

// GET all articles
const getAllArticles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const articles = await articleDao.findAll();
    res.json(articles);
  } catch (error) {
    next(error);
  }
};

export default function installArticleRouter(router: Router): void {
  // GET routes
  router.get("/articles", getAllArticles);
}
