import express from 'express';

export default interface Controller {
  get router(): express.Router;
}
