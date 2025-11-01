import { Router, Request, Response, NextFunction } from "express";
import { ArticleDAO } from "../dao/ArticleDao";
import { ServiceError } from "../core/serviceError";
import Joi from "joi";
import validate from "../core/validation";

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

const getArticleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const articleId = parseInt(req.params.id, 10);
    const article = await articleDao.findById(articleId);
    if (!article) {
      throw ServiceError.notFound("Article not found", { id: articleId });
    }
    res.json(article);
  } catch (error) {
    next(error);
  }
};

getArticleById.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

export default function installArticleRouter(router: Router): void {
  // GET routes
  router.get("/articles", getAllArticles);
  router.get(
    "/articles/:id",
    validate(getArticleById.validationScheme),
    getArticleById
  );
}
