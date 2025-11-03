import { Router, Request, Response, NextFunction } from "express";
import BlogDAO from "../dao/BlogDao";
import { ServiceError } from "../core/serviceError";
import validate from "../core/validation";
import Joi from "joi";

const blogDao = new BlogDAO();

//GET ALL BLOGS
const getAllBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blogs = await blogDao.findAll();
    res.json(blogs);
  } catch (error) {
    next(error);
  }
};

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

// POST create new blog(s) - single or bulk
const createBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if body is an array (bulk) or single object
    const isBulk = Array.isArray(req.body);

    if (isBulk) {
      // Bulk insert
      const blogsData = req.body.map((blogData: any) => {
        const wordCount = blogData.Content.split(/\s+/).filter(
          (word: string) => word.length > 0
        ).length;
        const readtimeInMinutes = Math.ceil(wordCount / 200);

        return {
          Title: blogData.Title,
          Excerpt: blogData.Excerpt,
          Content: blogData.Content,
          Slug: blogData.Slug,
          Tags: blogData.Tags || [],
          Readtime: readtimeInMinutes,
        };
      });

      const savedBlogs = await blogDao.createBulk(blogsData);
      res.status(201).json(savedBlogs);
    } else {
      // Single insert
      const wordCount = req.body.Content.split(/\s+/).filter(
        (word: string) => word.length > 0
      ).length;
      const readtimeInMinutes = Math.ceil(wordCount / 200);

      const payload = {
        Title: req.body.Title,
        Excerpt: req.body.Excerpt,
        Content: req.body.Content,
        Slug: req.body.Slug,
        Tags: req.body.Tags,
        Readtime: readtimeInMinutes,
      };
      const blog = await blogDao.create(payload);
      res.status(201).json(blog);
    }
  } catch (error) {
    next(error);
  }
};
createBlog.validationScheme = {
  body: Joi.alternatives().try(
    // Single blog object
    Joi.object({
      Title: Joi.string().min(1).max(200).required(),
      Excerpt: Joi.string().min(1).max(500).required(),
      Content: Joi.string().min(1).required(),
      Slug: Joi.string().max(255).required(),
      Tags: Joi.array().items(Joi.string().max(50)).optional(),
    }),
    // Array of blogs
    Joi.array()
      .items(
        Joi.object({
          Title: Joi.string().min(1).max(200).required(),
          Excerpt: Joi.string().min(1).max(500).required(),
          Content: Joi.string().min(1).required(),
          Slug: Joi.string().max(255).required(),
          Tags: Joi.array().items(Joi.string().max(50)).optional(),
        })
      )
      .min(1)
  ) as any, // Type assertion to work with validation middleware
};

// PUT update blog
const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Calculate read time based on content (average reading speed: 200 words per minute)
    const wordCount = req.body.Content.split(/\s+/).filter(
      (word: string) => word.length > 0
    ).length;
    const readtimeInMinutes = Math.ceil(wordCount / 200);

    const payload = {
      Title: req.body.Title,
      Excerpt: req.body.Excerpt,
      Content: req.body.Content,
      Slug: req.body.Slug,
      Tags: req.body.Tags,
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
    Title: Joi.string().min(1).max(200).required(),
    Excerpt: Joi.string().min(1).max(500).required(),
    Content: Joi.string().min(1).required(),
    Slug: Joi.string().max(255).required(),
    Tags: Joi.array().items(Joi.string().max(50)).optional(),
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
  router.get("/blogs", getAllBlogs);
  router.get("/blogs/:id", validate(getBlogById.validationScheme), getBlogById);

  // POST routes - handles both single and bulk creation
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
