import { Router, Request, Response, NextFunction } from "express";
import ArticleDAO from "../dao/ArticleDao";
import { ServiceError } from "../core/serviceError";
import Joi from "joi";
import validate from "../core/validation";
import Article from "../data/entity/Article";

const articleDao = new ArticleDAO();

/**
 * @openapi
 * /api/articles:
 *   get:
 *     summary: Get all articles
 *     description: Retrieve all articles (both blogs and vlogs). Optionally filter by tag.
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *           maxLength: 50
 *         description: Filter articles by tag
 *         example: technology
 *     responses:
 *       200:
 *         description: List of articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Article'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @openapi
 * /api/articles/{id}:
 *   get:
 *     summary: Get article by ID
 *     description: Retrieve a single article by its ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The article ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Article details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @openapi
 * /api/articles/slug/{slug}:
 *   get:
 *     summary: Get article by slug
 *     description: Retrieve a single article by its URL slug
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 128
 *         description: The article slug (URL-friendly identifier)
 *         example: getting-started-with-typeorm
 *     responses:
 *       200:
 *         description: Article details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
    "/articles/:id",
    validate(getArticleById.validationScheme),
    getArticleById
  );
  router.get(
    "/articles/slug/:slug",
    validate(getArticleBySlug.validationScheme),
    getArticleBySlug
  );
}
