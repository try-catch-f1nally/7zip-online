import express from 'express';

export default interface ErrorMiddlewareServiceService {
  get errorMiddleware(): express.ErrorRequestHandler;
}
