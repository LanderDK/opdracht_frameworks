import { Router, Request, Response, NextFunction, Application } from "express";
import ArticleDAO from "../dao/ArticleDao";
import BlogDAO from "../dao/BlogDao";
import VlogDAO from "../dao/VlogDao";
import CommentDAO from "../dao/CommentDao";
import { ServiceError } from "../core/serviceError";
import Article from "../data/entity/Article";
import validate from "../core/validation";
import Joi from "joi";
import { UserArticleDAO } from "../dao/UserArticleDao";


const articleDao = new ArticleDAO();
const blogDao = new BlogDAO();
const vlogDao = new VlogDAO();
const commentDao = new CommentDAO();
const userArticleDao = new UserArticleDAO();

// Homepage - overzicht van alle articles
const homepage = async (req: Request, res: Response, next: NextFunction) => {
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
    res.render("index", {
      title: "Home - Articles Overview",
      articles: articles,
    });
  } catch (error) {
    next(error);
  }
};
homepage.validationScheme = {
  query: {
    tag: Joi.string().max(50).optional(),
  },
};

// Blog detail pagina (by ID)
const blogDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const blog = await blogDao.findById(id);
    if (!blog) {
      throw ServiceError.notFound("Blog not found", { id });
    }

    // Load comments for this article
    const comments = await commentDao.findAllByArticleId(id);
    const authors = await userArticleDao.findAuthorsByArticleId(id);
    res.render("blog-detail", {
      title: `Blog Detail - ${blog.Title}`,
      blog: blog,
      comments: comments,
      authors: authors,
    });
  } catch (error) {
    next(error);
  }
};
blogDetail.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

// Vlog detail pagina (by ID)
const vlogDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const vlog = await vlogDao.findById(id);
    if (!vlog) {
      throw ServiceError.notFound("Vlog not found", { id });
    }
    
    // Load comments for this article
    const comments = await commentDao.findAllByArticleId(id);
    const authors = await userArticleDao.findAuthorsByArticleId(id);
    const test = await vlog.VideoFile;
    res.render("vlog-detail", {
      title: `Vlog Detail - ${vlog.Title}`,
      vlog: vlog,
      url: test.VideoFileUrl,
      comments: comments,
      authors: authors,
    });
  } catch (error) {
    next(error);
  }
};
vlogDetail.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

export default function installViewRoutes(app: Application): void {
  const router = Router();

  router.get("/", validate(homepage.validationScheme), homepage);
  router.get("/blogs/:id", validate(blogDetail.validationScheme), blogDetail);
  router.get("/vlogs/:id", validate(vlogDetail.validationScheme), vlogDetail);

  app.use("/", router);
}
