import { Router, Request, Response, NextFunction } from "express";
import { BlogDAO } from "../dao/BlogDao";
import { ServiceError } from "../core/serviceError";
import validate from "../core/validation";
import Joi from "joi";
import { ArticleDAO } from "../dao/ArticleDao";
import { Article } from "../data/entity/Article";

const blogDao = new BlogDAO();

// GET blog by ID
const getBlogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const blog = await blogDao.findById(id);

    if (!blog) {
      throw ServiceError.notFound("Blog not found", { id });
    }

    res.json(blog);
  } catch (error) {
    next(error);
  }
};
getBlogById.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

// POST create new blog
const createBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Calculate read time based on content (average reading speed: 200 words per minute)
    const wordCount = req.body.Article.Content
      .split(/\s+/)
      .filter((word: string) => word.length > 0).length;
    const readtimeInMinutes = Math.ceil(wordCount / 200);

    const payload = {
      Article: {
        Title: req.body.Article.Title,
        Excerpt: req.body.Article.Excerpt,
        Content: req.body.Article.Content,
        Slug: req.body.Article.Slug,
        Tags: req.body.Article.Tags,
      } as any,
      Readtime: readtimeInMinutes,
    };
    const blog = await blogDao.create(payload);
    res.status(201).json(blog);
  } catch (error) {
    next(error);
  }
};
createBlog.validationScheme = {
  body: {
    Article: Joi.object({
      Title: Joi.string().min(1).max(200).required(),
      Excerpt: Joi.string().min(1).max(500).required(),
      Content: Joi.string().min(1).required(),
      Slug: Joi.string().max(255).required(),
      Tags: Joi.array().items(Joi.string().max(50)).optional(),
    }).required(),
  }
};

// PUT update blog
const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Calculate read time based on content (average reading speed: 200 words per minute)
    const wordCount = req.body.Article.Content
      .split(/\s+/)
      .filter((word: string) => word.length > 0).length;
    const readtimeInMinutes = Math.ceil(wordCount / 200);

    const payload = {
      Article: {
        Title: req.body.Article.Title,
        Excerpt: req.body.Article.Excerpt,
        Content: req.body.Article.Content,
        Slug: req.body.Article.Slug,
        Tags: req.body.Article.Tags,
      } as any,
      Readtime: readtimeInMinutes,
    };

    const blog = await blogDao.update(id, payload);

    if (!blog) {
      throw ServiceError.notFound("Blog not found", { id });
    }

    res.json(blog);
  } catch (error) {
    next(error);
  }
};
updateBlog.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
  body: {
    Article: Joi.object({
      Title: Joi.string().min(1).max(200).required(),
      Excerpt: Joi.string().min(1).max(500).required(),
      Content: Joi.string().min(1).required(),
      Slug: Joi.string().max(255).required(),
      Tags: Joi.array().items(Joi.string().max(50)).optional(),
    }).required(),
  }
};

// DELETE blog
const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const success = await blogDao.delete(id);

    if (!success) {
      throw ServiceError.notFound("Blog not found", { id });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
deleteBlog.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

const getAllBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogs = await blogDao.findAll();
    res.json(blogs);
  } catch (error) {
    next(error);
  }
};

export default function installBlogRouter(router: Router): void {
  // GET routes
  router.get("/blogs", getAllBlogs);
  router.get("/blogs/:id", validate(getBlogById.validationScheme), getBlogById);

  // POST routes
  router.post("/blogs", validate(createBlog.validationScheme), createBlog);

  // PUT routes
  router.put("/blogs/:id", validate(updateBlog.validationScheme), updateBlog);

  // DELETE routes
  router.delete(
    "/blogs/:id",
    validate(deleteBlog.validationScheme),
    deleteBlog
  );
}
