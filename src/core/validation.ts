import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { ServiceError } from "./serviceError";

const JOI_OPTIONS: Joi.ValidationOptions = {
  abortEarly: true,
  allowUnknown: false,
  convert: true,
  presence: "required",
};

interface ValidationError {
  type: string;
  message: string;
}

interface CleanedErrors {
  [key: string]: ValidationError[];
}

interface ValidationSchema {
  query?: Joi.ObjectSchema | Record<string, Joi.Schema>;
  body?: Joi.ObjectSchema | Record<string, Joi.Schema>;
  params?: Joi.ObjectSchema | Record<string, Joi.Schema>;
}

const cleanupJoiError = (error: Joi.ValidationError): CleanedErrors =>
  error.details.reduce((resultObj: CleanedErrors, { message, path, type }) => {
    const joinedPath = path.join(".") || "value";
    if (!resultObj[joinedPath]) {
      resultObj[joinedPath] = [];
    }
    resultObj[joinedPath].push({
      type,
      message,
    });

    return resultObj;
  }, {});

const validate = (schema?: ValidationSchema) => {
  if (!schema) {
    schema = {
      query: {},
      body: {},
      params: {},
    };
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const errors: {
      query?: CleanedErrors;
      body?: CleanedErrors;
      params?: CleanedErrors;
    } = {};

    // Validate query parameters
    if (schema.query) {
      let querySchema = schema.query;
      if (!Joi.isSchema(querySchema)) {
        querySchema = Joi.object(querySchema);
      }

      const { error: queryErrors } = querySchema.validate(
        req.query,
        JOI_OPTIONS
      );

      if (queryErrors) {
        errors.query = cleanupJoiError(queryErrors);
      }
      // Note: req.query is read-only in Express, so we don't assign the validated value
    }

    // Validate request body
    if (schema.body) {
      let bodySchema = schema.body;
      if (!Joi.isSchema(bodySchema)) {
        bodySchema = Joi.object(bodySchema);
      }

      const { error: bodyErrors, value: bodyValue } = bodySchema.validate(
        req.body,
        JOI_OPTIONS
      );

      if (bodyErrors) {
        errors.body = cleanupJoiError(bodyErrors);
      } else {
        req.body = bodyValue;
      }
    }

    // Validate route parameters
    if (schema.params) {
      let paramsSchema = schema.params;
      if (!Joi.isSchema(paramsSchema)) {
        paramsSchema = Joi.object(paramsSchema);
      }

      const { error: paramsErrors, value: paramsValue } = paramsSchema.validate(
        req.params,
        JOI_OPTIONS
      );

      if (paramsErrors) {
        errors.params = cleanupJoiError(paramsErrors);
      } else {
        req.params = paramsValue;
      }
    }

    // If there are validation errors, throw ServiceError
    if (Object.keys(errors).length) {
      if (errors.body && Object.keys(errors.body).length) {
        const errorMessage =
          Object.values(errors.body)[0]?.find((errorObj) => errorObj.message)
            ?.message || "Validation failed";
        throw ServiceError.validationFailed(errorMessage, errors.body);
      } else if (errors.params && Object.keys(errors.params).length) {
        const errorMessage =
          Object.values(errors.params)[0]?.find((errorObj) => errorObj.message)
            ?.message || "Validation failed";
        throw ServiceError.validationFailed(errorMessage, errors.params);
      } else if (errors.query && Object.keys(errors.query).length) {
        const errorMessage =
          Object.values(errors.query)[0]?.find((errorObj) => errorObj.message)
            ?.message || "Validation failed";
        throw ServiceError.validationFailed(errorMessage, errors.query);
      }
    }

    return next();
  };
};

export default validate;
