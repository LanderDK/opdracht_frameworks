import { Router, Request, Response, NextFunction } from "express";
import { CommentDAO } from "../dao/CommentDao";
import Joi from "joi";
import validate from "../core/validation";
import ServiceError from "../core/serviceError";

const commentDao = new CommentDAO();

const getAllCommentsByArticleId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const articleId = parseInt(req.params.articleId, 10); 
    const comments = await commentDao.findAllByArticleId(articleId);
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

getAllCommentsByArticleId.validationScheme = {
  params: {
    articleId: Joi.number().integer().positive().required(),
  },
};

const createComment = async(
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = {
      UserId: req.body.UserId,
      Content: req.body.Content,
    }
    const articleId = parseInt(req.params.articleId, 10);

    // Create comment
    const comment = await commentDao.create(
      
      {
        ...payload,
        ArticleId: articleId,
        PublishedAt: new Date(),
      }
    );
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

createComment.validationScheme = {
  body:{
    UserId: Joi.number().integer().positive().required(),
    Content: Joi.string().min(2).max(1000).required(),
  },
};


const updateComment = async(
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const articleId = parseInt(req.params.articleId, 10);
    const commentId = parseInt(req.params.commentId, 10);
    const payload = {
      Content: req.body.Content,
      articleId: articleId,
    };
    const comment = await commentDao.update(commentId, payload);
    if (!comment) {
      throw ServiceError.notFound("Comment not found", { commentId });
    }
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

updateComment.validationScheme = {
  params: {
    articleId: Joi.number().integer().positive().required(),
    commentId: Joi.number().integer().positive().required(),
  },
  body: {
    Content: Joi.string().min(2).max(1000).required(),
  },
};

const deleteComment = async(
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const articleId = parseInt(req.params.articleId, 10);
    const commentId = parseInt(req.params.commentId, 10);
    const success = await commentDao.delete(commentId);
    if (!success) {
      throw ServiceError.notFound("Comment not found", { commentId });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export default function installCommentRouter(router: Router): void {
// GET comment by articleId
  router.get(
    "/articles/:articleId/comments",
    validate(getAllCommentsByArticleId.validationScheme),
    getAllCommentsByArticleId
  );

  // POST create comment for articleId
  router.post(
    "/articles/:articleId/comments",
    validate(createComment.validationScheme), createComment);
  
  // PUT update comment
  router.put(
    "/articles/:articleId/comments/:commentId",
    validate(updateComment.validationScheme),
    updateComment
  );

  // DELETE comment
  router.delete(
    "/articles/:articleId/comments/:commentId",
    deleteComment
  );



}