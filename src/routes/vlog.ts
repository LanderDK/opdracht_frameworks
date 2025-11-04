import { Router, Request, Response, NextFunction } from "express";
import VlogDAO from "../dao/VlogDao";
import { ServiceError } from "../core/serviceError";
import validate from "../core/validation";
import Joi from "joi";
import { UserArticleDAO } from "../dao/UserArticleDao";

const vlogDao = new VlogDAO();
const userArticleDao = new UserArticleDAO();
/**
 * @openapi
 * /api/vlogs:
 *   get:
 *     summary: Get all vlogs
 *     description: Retrieve all video blog posts
 *     tags: [Vlogs]
 *     responses:
 *       200:
 *         description: List of vlogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vlog'
 */
//GET ALL VLOGS
const getAllVlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vlogs = await vlogDao.findAll();
    res.json(vlogs);
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/vlogs/{id}:
 *   get:
 *     summary: Get vlog by ID
 *     description: Retrieve a single vlog by its ID including video file information
 *     tags: [Vlogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The vlog ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Vlog details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vlog'
 *       404:
 *         description: Vlog not found
 */
// GET vlog by ID
const getVlogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const vlog = await vlogDao.findById(id);

    if (!vlog) {
      throw ServiceError.notFound("Vlog not found", { id });
    }

    res.json(vlog);
  } catch (error) {
    next(error);
  }
};
getVlogById.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

/**
 * @openapi
 * /api/vlogs:
 *   post:
 *     summary: Create new vlog(s)
 *     description: Create one or multiple vlogs. Supports both single and bulk creation. Each vlog requires a VideoFile with VideoFileUrl.
 *     tags: [Vlogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/VlogInput'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/VlogInput'
 *           examples:
 *             single:
 *               summary: Single vlog
 *               value:
 *                 Title: "My First Vlog"
 *                 Content: "This is the vlog content..."
 *                 Excerpt: "A short introduction"
 *                 Slug: "my-first-vlog"
 *                 UserIds: [1]
 *                 Tags: ["vlog", "video"]
 *                 VideoFile:
 *                   VideoFileUrl: "https://example.com/video.mp4"
 *             bulk:
 *               summary: Multiple vlogs
 *               value:
 *                 - Title: "Vlog 1"
 *                   Content: "Content..."
 *                   Excerpt: "Excerpt..."
 *                   Slug: "vlog-1"
 *                   UserIds: [1, 2]
 *                   Tags: ["tech"]
 *                   VideoFile:
 *                     VideoFileUrl: "https://example.com/video1.mp4"
 *                 - Title: "Vlog 2"
 *                   Content: "More content..."
 *                   Excerpt: "Another excerpt..."
 *                   Slug: "vlog-2"
 *                   UserIds: [2]
 *                   Tags: ["tutorial"]
 *                   VideoFile:
 *                     VideoFileUrl: "https://example.com/video2.mp4"
 *     responses:
 *       201:
 *         description: Vlog(s) created successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Vlog'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vlog'
 *       400:
 *         description: Validation error
 */
// POST create new vlog(s) - single or bulk
const createVlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if body is an array (bulk) or single object
    const isBulk = Array.isArray(req.body);

    if (isBulk) {
      // Bulk insert
      const vlogsData = req.body.map((vlogData: any) => ({
        Title: vlogData.Title,
        Excerpt: vlogData.Excerpt,
        Content: vlogData.Content,
        Slug: vlogData.Slug,
        Tags: vlogData.Tags,
        VideoFile: vlogData.VideoFile,
      }));

      const savedVlogs = await vlogDao.createBulk(vlogsData);
      for (let i = 0; i < savedVlogs.length; i++) {
        const userids = req.body[i].UserIds;
        const article_id = savedVlogs[i].ArticleId;

        for (const uid of userids || []) {
          const payload_ua = {
            UserId: uid,
            ArticleId: article_id,
          };
          await userArticleDao.create(payload_ua);
        }
      }
      res.status(201).json(savedVlogs);
    } else {
      // Single insert
      const userids = req.body.UserIds;
      const payload = {
        Title: req.body.Title,
        Excerpt: req.body.Excerpt,
        Content: req.body.Content,
        Slug: req.body.Slug,
        Tags: req.body.Tags,
        VideoFile: req.body.VideoFile,
      };
      const vlog = await vlogDao.create(payload);
      const article_id = vlog.ArticleId;

      for (const uid of userids || []) {
        const payload_ua = {
          UserId: uid,
          ArticleId: article_id,
        };
        await userArticleDao.create(payload_ua);
      }
      res.status(201).json(vlog);
    }
  } catch (error) {
    next(error);
  }
};
createVlog.validationScheme = {
  body: Joi.alternatives().try(
    // Single vlog object
    Joi.object({
      Title: Joi.string().min(1).max(200).required(),
      Excerpt: Joi.string().min(1).max(500).required(),
      Content: Joi.string().min(1).required(),
      Slug: Joi.string().max(255).required(),
      UserIds: Joi.array().items(Joi.number().integer().positive()).optional(),
      Tags: Joi.array().items(Joi.string().max(50)).optional(),
      VideoFile: Joi.object({
        VideoFileUrl: Joi.string().uri().required(),
      }).required(),
    }),
    // Array of vlogs
    Joi.array()
      .items(
        Joi.object({
          Title: Joi.string().min(1).max(200).required(),
          Excerpt: Joi.string().min(1).max(500).required(),
          Content: Joi.string().min(1).required(),
          Slug: Joi.string().max(255).required(),
          Tags: Joi.array().items(Joi.string().max(50)).optional(),
          UserIds: Joi.array().items(Joi.number().integer().positive()).optional(),
          VideoFile: Joi.object({
            VideoFileUrl: Joi.string().uri().required(),
          }).required(),
        })
      )
      .min(1)
  ) as any, // Type assertion to work with validation middleware
};

/**
 * @openapi
 * /api/vlogs/{id}:
 *   put:
 *     summary: Update a vlog
 *     description: Update an existing vlog by its ID. Note that VideoFile cannot be updated through this endpoint.
 *     tags: [Vlogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The vlog ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 example: "Updated Vlog Title"
 *               Excerpt:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 500
 *                 example: "Updated excerpt"
 *               Content:
 *                 type: string
 *                 minLength: 50
 *                 example: "Updated vlog content here..."
 *               Slug:
 *                 type: string
 *                 maxLength: 255
 *                 example: "updated-vlog-title"
 *               Tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 50
 *                 example: ["updated", "vlog"]
 *     responses:
 *       200:
 *         description: Vlog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vlog'
 *       404:
 *         description: Vlog not found
 *       400:
 *         description: Validation error
 */
// PUT update vlog
const updateVlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);

    const payload = {
      Title: req.body.Title,
      Excerpt: req.body.Excerpt,
      Content: req.body.Content,
      Slug: req.body.Slug,
      Tags: req.body.Tags,
    };

    const vlog = await vlogDao.update(id, payload);

    if (!vlog) {
      throw ServiceError.notFound("Vlog not found", { id });
    }

    res.json(vlog);
  } catch (error) {
    next(error);
  }
};
updateVlog.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
  body: {
    Title: Joi.string().min(5).max(200).optional(),
    Excerpt: Joi.string().min(20).max(500).optional(),
    Content: Joi.string().min(50).optional(),
    Slug: Joi.string().max(255).optional(),
    Tags: Joi.array().items(Joi.string().max(50)).optional(),
  },
};

/**
 * @openapi
 * /api/vlogs/{id}:
 *   delete:
 *     summary: Delete a vlog
 *     description: Permanently delete a vlog by its ID. This will also delete the associated VideoFile.
 *     tags: [Vlogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The vlog ID
 *         example: 1
 *     responses:
 *       204:
 *         description: Vlog deleted successfully (no content)
 *       404:
 *         description: Vlog not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// DELETE vlog
const deleteVlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const success = await vlogDao.delete(id);

    if (!success) {
      throw ServiceError.notFound("Vlog not found", { id });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
deleteVlog.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

export default function installVlogRouter(router: Router): void {
  // GET routes
  router.get("/vlogs/", getAllVlogs);
  router.get("/vlogs/:id", validate(getVlogById.validationScheme), getVlogById);

  // POST routes
  router.post("/vlogs", validate(createVlog.validationScheme), createVlog);

  // PUT routes
  router.put("/vlogs/:id", validate(updateVlog.validationScheme), updateVlog);

  // DELETE routes
  router.delete(
    "/vlogs/:id",
    validate(deleteVlog.validationScheme),
    deleteVlog
  );
}
