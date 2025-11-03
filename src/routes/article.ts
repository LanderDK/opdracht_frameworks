import { Router, Request, Response, NextFunction } from "express";
import ArticleDAO from "../dao/ArticleDao";
import { ServiceError } from "../core/serviceError";
import Joi from "joi";
import validate from "../core/validation";
import Article from "../data/entity/Article";

const articleDao = new ArticleDAO();

// GET all articles (optionally filter by tag)
const getAllArticles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tag = req.query.tag as string | undefined;

    let articles: Article[];
    if (tag) {
      // Filter by tag using QueryBuilder
      articles = await articleDao.findByTag(tag);
    } else {
      // Get all articles
      articles = await articleDao.findAll();
    }

    res.json(articles);
  } catch (error) {
    next(error);
  }
};
getAllArticles.validationScheme = {
  query: {
    tag: Joi.string().max(50).optional(),
  },
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

// GET article by slug (parameter query)
const getArticleBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const slug = req.params.slug;
    const article = await articleDao.findBySlug(slug);
    if (!article) {
      throw ServiceError.notFound("Article not found", { slug });
    }
    res.json(article);
  } catch (error) {
    next(error);
  }
};

getArticleBySlug.validationScheme = {
  params: {
    slug: Joi.string().max(128).required(),
  },
};

export default function installArticleRouter(router: Router): void {
  // GET routes
  router.get(
    "/articles",
    validate(getAllArticles.validationScheme),
    getAllArticles
  );
  router.get(
    "/articles/slug/:slug",
    validate(getArticleBySlug.validationScheme),
    getArticleBySlug
  );
  router.get(
    "/articles/:id",
    validate(getArticleById.validationScheme),
    getArticleById
  );
}
