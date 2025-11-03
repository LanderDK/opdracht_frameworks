import { Router, Request, Response, NextFunction } from "express";
import BlogDAO from "../dao/BlogDao";
import { ServiceError } from "../core/serviceError";
import validate from "../core/validation";
import Joi from "joi";

const blogDao = new BlogDAO();

/**
 * @openapi
 * /api/blogs:
 *   get:
 *     summary: Get all blogs
 *     description: Retrieve all blog posts
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 */
//GET ALL BLOGS
const getAllBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blogs = await blogDao.findAll();
    res.json(blogs);
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/blogs/{id}:
 *   get:
 *     summary: Get blog by ID
 *     description: Retrieve a single blog post by its ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The blog ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Blog details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog not found
 */
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

/**
 * @openapi
 * /api/blogs:
 *   post:
 *     summary: Create new blog(s)
 *     description: Create one or multiple blog posts. Supports both single and bulk creation.
 *     tags: [Blogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/BlogInput'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/BlogInput'
 *           examples:
 *             single:
 *               summary: Single blog
 *               value:
 *                 Title: "Getting Started with TypeORM"
 *                 Excerpt: "Learn the basics of TypeORM"
 *                 Content: "TypeORM is a powerful ORM..."
 *                 Slug: "getting-started-with-typeorm"
 *                 Tags: ["typescript", "database", "orm"]
 *             bulk:
 *               summary: Multiple blogs
 *               value:
 *                 - Title: "First Blog"
 *                   Excerpt: "Excerpt..."
 *                   Content: "Content here..."
 *                   Slug: "first-blog"
 *                   Tags: ["tech"]
 *                 - Title: "Second Blog"
 *                   Excerpt: "Another excerpt..."
 *                   Content: "More content..."
 *                   Slug: "second-blog"
 *                   Tags: ["coding"]
 *     responses:
 *       201:
 *         description: Blog(s) created successfully
 *       400:
 *         description: Validation error
 */
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

/**
 * @openapi
 * /api/blogs/{id}:
 *   put:
 *     summary: Update a blog
 *     description: Update an existing blog post by its ID. Read time is automatically calculated based on content.
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The blog ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Title
 *               - Excerpt
 *               - Content
 *               - Slug
 *             properties:
 *               Title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: "Updated Blog Title"
 *               Excerpt:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 example: "Updated excerpt"
 *               Content:
 *                 type: string
 *                 minLength: 1
 *                 example: "Updated blog content here..."
 *               Slug:
 *                 type: string
 *                 maxLength: 255
 *                 example: "updated-blog-title"
 *               Tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 50
 *                 example: ["updated", "blog"]
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog not found
 *       400:
 *         description: Validation error
 */
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

/**
 * @openapi
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete a blog
 *     description: Permanently delete a blog post by its ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The blog ID
 *         example: 1
 *     responses:
 *       204:
 *         description: Blog deleted successfully (no content)
 *       404:
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
