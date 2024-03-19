import ErrorHandler from "../utils/ErrorHandler";
import { Request, Response, NextFunction } from "express";

export const ErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Server Error";

  // wrong mongodb id error
  if (err.name == "CastError") {
    const message = `Resource not found. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key Error
  if (err.code == 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }
  // wrong jwt error
  if (err.name == "JsonTokenError") {
    const message = `Json web token is invalid, pls try again`;
    err = new ErrorHandler(message, 400);
  }
  // JWT expired error
  if (err.name == "TokenExpiredError") {
    const message = `Json web token is expired , pls try again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    sucess: false,
    message: err.message,
  });
};
