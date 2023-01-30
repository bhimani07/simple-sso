import { ErrorRequestHandler } from "express";
import AppError from "./ApplicationError";

const statusMessages = {
  400: "Bad Request",
  401: "Unauthorized",
  404: "Not Found",
  500: "Internal Server Error",
};

const catcher: ErrorRequestHandler = (err, req, res, next) => {
  console.error({ catcherError: err });

  let status = 500;
  let message = statusMessages[500];

  if (err instanceof AppError) {
    status = err.statusCode;
    message = err.message;
  }

  res.status(status).json({
    message: message,
  });
};

export default catcher;
