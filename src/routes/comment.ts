import { Router, Request, Response, NextFunction } from "express";
import CommentDAO from "../dao/CommentDao";
import ArticleDAO from "../dao/ArticleDao";
import Joi from "joi";
import validate from "../core/validation";
import ServiceError from "../core/serviceError";

const commentDao = new CommentDAO();
const articleDao = new ArticleDAO();

/**
 * @openapi
 * /api/articles/{articleId}/comments:
 *   get:
 *     summary: Get all comments for an article
 *     description: Retrieve all comments associated with a specific article
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The article ID
 *         example: 1
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
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

/**
 * @openapi
 * /api/articles/{articleId}/comments:
 *   post:
 *     summary: Create a new comment
 *     description: Add a new comment to an article. This will trigger a real-time WebSocket broadcast to all connected clients.
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The article ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - UserId
 *               - Content
 *             properties:
 *               UserId:
 *                 type: integer
 *                 description: The ID of the user posting the comment
 *                 example: 1
 *               Content:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 1000
 *                 description: The comment content
 *                 example: "Great article! Very informative."
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = {
      ArticleId: parseInt(req.params.articleId, 10),
      UserId: req.body.UserId,
      Content: req.body.Content,
    };

    const article = await articleDao.findById(payload.ArticleId);
    if (!article) {
      throw ServiceError.notFound("Article not found", {
        articleId: payload.ArticleId,
      });
    }

    const comment = await commentDao.create(payload);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};
createComment.validationScheme = {
  params: {
    articleId: Joi.number().integer().positive().required(),
  },
  body: {
    UserId: Joi.number().integer().positive().required(),
    Content: Joi.string().min(2).max(1000).required(),
  },
};

/**
 * @openapi
 * /api/articles/{articleId}/comments/{commentId}:
 *   put:
 *     summary: Update a comment
 *     description: Update the content of an existing comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The article ID
 *         example: 1
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The comment ID
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Content
 *             properties:
 *               Content:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 1000
 *                 description: The updated comment content
 *                 example: "This is my updated comment."
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *       400:
 *         description: Validation error
 */
const updateComment = async (
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

    const article = await articleDao.findById(articleId);
    if (!article) {
      throw ServiceError.notFound("Article not found", { articleId });
    }

    const comment = await commentDao.update(
      commentId,
      article.ArticleId,
      payload
    );
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

/**
 * @openapi
 * /api/articles/{articleId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     description: Permanently delete a comment from an article
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The article ID
 *         example: 1
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The comment ID to delete
 *         example: 5
 *     responses:
 *       204:
 *         description: Comment deleted successfully (no content)
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const articleId = parseInt(req.params.articleId, 10);
    const commentId = parseInt(req.params.commentId, 10);
    const success = await commentDao.delete(commentId, articleId);
    if (!success) {
      throw ServiceError.notFound("Comment not found", { commentId });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
deleteComment.validationScheme = {
  params: {
    articleId: Joi.number().integer().positive().required(),
    commentId: Joi.number().integer().positive().required(),
  },
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
    validate(createComment.validationScheme),
    createComment
  );

  // PUT update comment
  router.put(
    "/articles/:articleId/comments/:commentId",
    validate(updateComment.validationScheme),
    updateComment
  );

  // DELETE comment
  router.delete(
    "/articles/:articleId/comments/:commentId",
    validate(deleteComment.validationScheme),
    deleteComment
  );
}
