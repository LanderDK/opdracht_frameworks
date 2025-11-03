import UserDAO from "../dao/UserDao";
import { Router, Request, Response, NextFunction } from "express";
import Joi from "joi";
import validate from "../core/validation";
import ServiceError from "../core/serviceError";

const userDao = new UserDAO();

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
