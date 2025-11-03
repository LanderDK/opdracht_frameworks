import UserDAO from "../dao/UserDao";
import { Router, Request, Response, NextFunction } from "express";
import Joi from "joi";
import validate from "../core/validation";
import ServiceError from "../core/serviceError";

const userDao = new UserDAO();

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a single user by their ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *         example: 1
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await userDao.findById(id);

    if (!user) {
      throw ServiceError.notFound("User not found", { id });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};
getUserById.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Register a new user in the system
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Username
 *               - Email
 *               - Roles
 *             properties:
 *               Username:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: User's username
 *                 example: "johndoe"
 *               Email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *               Roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [user, admin]
 *                 description: User roles
 *                 example: ["user"]
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 */
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userDao.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};
createUser.validationScheme = {
  body: {
    Username: Joi.string().min(2).max(100).required(),
    Roles: Joi.array().items(Joi.string().valid("user", "admin")).required(),
    Email: Joi.string().email().required(),
  },
};

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     description: Update an existing user's information
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Email
 *             properties:
 *               Email:
 *                 type: string
 *                 format: email
 *                 description: User's updated email address
 *                 example: "newemail@example.com"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       400:
 *         description: Validation error
 */
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await userDao.update(id, req.body);

    if (!user) {
      throw ServiceError.notFound("User not found", { id });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};
updateUser.validationScheme = {
  body: {
    Email: Joi.string().email().required(),
  },
};

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Permanently delete a user from the system
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *         example: 1
 *     responses:
 *       204:
 *         description: User deleted successfully (no content)
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const success = await userDao.delete(id);
    if (!success) {
      throw ServiceError.notFound("User not found", { id });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
deleteUser.validationScheme = {
  params: {
    id: Joi.number().integer().positive().required(),
  },
};

export default function installUserRouter(router: Router): void {
  // GET routes
  router.get("/users/:id", validate(getUserById.validationScheme), getUserById);

  // POST routes
  router.post("/users", validate(createUser.validationScheme), createUser);

  // PUT routes
  router.put("/users/:id", validate(updateUser.validationScheme), updateUser);

  // DELETE routes
  router.delete(
    "/users/:id",
    validate(deleteUser.validationScheme),
    deleteUser
  );
}
