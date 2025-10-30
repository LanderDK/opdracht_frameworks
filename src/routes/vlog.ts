import { Router, Request, Response, NextFunction } from "express";
import { VlogDAO } from "../dao/VlogDao";
import { ServiceError } from "../core/serviceError";
import validate from "../core/validation";
import Joi from "joi";

const vlogDao = new VlogDAO();

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
      article: {
        Title: req.body.title,
        Excerpt: req.body.excerpt,
        ArticleType: "vlog",
        Content: req.body.content,
        Slug: req.body.slug,
        Tags: req.body.tags,
      } as any,
      videofile: req.body.videofile,
    };
    const vlog = await vlogDao.create(payload);
    res.status(201).json(vlog);
  } catch (error) {
    next(error);
  }
};
createVlog.validationScheme = {
  body: {
    title: Joi.string().min(1).max(200).required(), // min 5
    excerpt: Joi.string().min(1).max(500).required(), // min 20
    content: Joi.string().min(1).required(), // min 50
    slug: Joi.string().max(255).required(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    videofile: Joi.string().uri().required(),
  },
};

// PUT update vlog
const updateVlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);

    const payload = {
      article: {
        Title: req.body.title,
        Excerpt: req.body.excerpt,
        Content: req.body.content,
        Slug: req.body.slug,
        Tags: req.body.tags,
      } as any,
      videofile: req.body.video_file,
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
    title: Joi.string().min(1).max(200).required(), // min 5
    excerpt: Joi.string().min(1).max(500).required(), // min 20
    content: Joi.string().min(1).required(), // min 50
    slug: Joi.string().max(255).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    videofile: Joi.string().uri().optional(),
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
