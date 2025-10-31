import { Router, Request, Response, NextFunction } from "express";
import { VlogDAO } from "../dao/VlogDao";
import { ServiceError } from "../core/serviceError";
import validate from "../core/validation";
import Joi from "joi";
import { VideoFile } from "../data/entity/VideoFile";

const vlogDao = new VlogDAO();

//GET ALL VLOGS
const getAllVlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vlogs = await vlogDao.findAll();
    res.json(vlogs);
  } catch (error) {
    next(error);
  }
};

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

// POST create new vlog
const createVlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = {
      Article: {
        Title: req.body.Article.Title,
        Excerpt: req.body.Article.Excerpt,
        ArticleType: "vlog",
        Content: req.body.Article.Content,
        Slug: req.body.Article.Slug,
        Tags: req.body.Article.Tags,
      } as any,
      VideoFile: req.body.VideoFile,
    };
    const vlog = await vlogDao.create(payload);
    res.status(201).json(vlog);
  } catch (error) {
    next(error);
  }
};
createVlog.validationScheme = {
  body: {
    Article: Joi.object({
      Title: Joi.string().min(1).max(200).required(), // min 5
      Excerpt: Joi.string().min(1).max(500).required(), // min 20
      Content: Joi.string().min(1).required(), // min 50
      Slug: Joi.string().max(255).optional(),
      Tags: Joi.array().items(Joi.string().max(50)).optional(),
    }).required(),
    VideoFile: Joi.object({
      VideoFileUrl: Joi.string().uri().required(),
    }).required(),
  },
};

// PUT update vlog
const updateVlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);

    const payload = {
      Article: {
        Title: req.body.Article.Title,
        Excerpt: req.body.Article.Excerpt,
        ArticleType: "vlog",
        Content: req.body.Article.Content,
        Slug: req.body.Article.Slug,
        Tags: req.body.Article.Tags,
      } as any,
      VideoFile: req.body.VideoFile,
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
    Article: Joi.object({
      Title: Joi.string().min(5).max(200).optional(),
      Excerpt: Joi.string().min(20).max(500).optional(),
      Content: Joi.string().min(50).optional(),
      Slug: Joi.string().max(255).optional(),
      Tags: Joi.array().items(Joi.string().max(50)).optional(),
    }).optional(),
    VideoFile: Joi.object({
      VideoFileUrl: Joi.string().uri().optional(),
    }).optional(),
  },
};

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
