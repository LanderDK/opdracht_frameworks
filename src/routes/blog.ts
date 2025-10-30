import { Router, Request, Response, NextFunction } from "express";
import { BlogDAO } from "../dao/BlogDao";
import { ServiceError } from "../core/serviceError";
import validate from "../core/validation";
import Joi from "joi";

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
    const wordCount = req.body.content
      .split(/\s+/)
      .filter((word: string) => word.length > 0).length;
    const readtimeInMinutes = Math.ceil(wordCount / 200);

    const payload = {
      article: {
        Title: req.body.title,
        Excerpt: req.body.excerpt,
        ArticleType: "blog",
        Content: req.body.content,
        Slug: req.body.slug,
        Tags: req.body.tags,
      } as any,
      readtime: readtimeInMinutes,
    };
    const blog = await blogDao.create(payload);
    res.status(201).json(blog);
  } catch (error) {
    next(error);
  }
};
createBlog.validationScheme = {
  body: {
    title: Joi.string().min(5).max(200).required(),
    excerpt: Joi.string().min(20).max(500).required(),
    content: Joi.string().min(50).required(),
    slug: Joi.string().max(255).required(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
  },
};

// PUT update blog
const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Calculate read time based on content (average reading speed: 200 words per minute)
    const wordCount = req.body.content
      .split(/\s+/)
      .filter((word: string) => word.length > 0).length;
    const readtimeInMinutes = Math.ceil(wordCount / 200);

    const payload = {
      ...req.body,
      readtime: readtimeInMinutes,
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
    title: Joi.string().min(5).max(200).optional(),
    excerpt: Joi.string().min(20).max(500).optional(),
    content: Joi.string().min(50).optional(),
    slug: Joi.string().max(255).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
  },
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

export default function installBlogRouter(router: Router): void {
  // GET routes
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
