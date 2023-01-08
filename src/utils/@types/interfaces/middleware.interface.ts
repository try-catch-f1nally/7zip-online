import express from 'express';

export default interface MiddlewareService {
  get middleware(): express.RequestHandler;
}
