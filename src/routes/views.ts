import { Router, Request, Response, NextFunction } from "express";

const router = Router();

// Homepage - overzicht van alle articles
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("index", {
      title: "Home - Articles Overview",
    });
  } catch (error) {
    next(error);
  }
});

// Blogs overzicht
router.get(
  "/blogs",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("blogs", {
        title: "Blogs",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Vlogs overzicht
router.get(
  "/vlogs",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("vlogs", {
        title: "Vlogs",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create new blog or vlog
router.get(
  "/create",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("create", {
        title: "Create New Content",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Blog detail pagina (by ID)
router.get(
  "/blogs/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blogId = parseInt(req.params.id, 10);
      res.render("blog-detail", {
        title: "Blog Detail",
        blogId: blogId,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Vlog detail pagina (by ID)
router.get(
  "/vlogs/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vlogId = parseInt(req.params.id, 10);
      res.render("vlog-detail", {
        title: "Vlog Detail",
        vlogId: vlogId,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
