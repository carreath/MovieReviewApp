import express from 'express';
import ReviewsController from './reviewsController';
export default express
  .Router()
  .get('/', ReviewsController.getDocuments.bind(ReviewsController))
  .get('/:id', ReviewsController.getDocument.bind(ReviewsController))
  .post('/', ReviewsController.addDocument.bind(ReviewsController))
  .put('/:id', ReviewsController.updateDocument.bind(ReviewsController))
  .delete('/:id', ReviewsController.deleteDocument.bind(ReviewsController))