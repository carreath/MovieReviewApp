import express from 'express';
import DevToolsController from './devToolsController';
export default express
  .Router()
  .get('/', DevToolsController.get.bind(DevToolsController))
  .post('/reinitialize', DevToolsController.reinitialize.bind(DevToolsController))
  .post('/clear', DevToolsController.clear.bind(DevToolsController))
  .delete('/:id', DevToolsController.delete.bind(DevToolsController))
  .post('/add-example', DevToolsController.addExampleReview.bind(DevToolsController));