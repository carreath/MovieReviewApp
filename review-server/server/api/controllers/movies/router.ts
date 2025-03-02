import express from 'express';
import MovieController from './movieController';
import ReviewsController from '../reviews/reviewsController';
export default express
  .Router()
  .get('/', MovieController.getMovies.bind(MovieController))
  .get('/:id', MovieController.getMovie.bind(MovieController))
  .post('/', MovieController.addMovie.bind(MovieController))
  .put('/:id', MovieController.updateMovie.bind(MovieController))
  .delete('/:id', MovieController.deleteMovie.bind(MovieController))
  .get('/search/title', MovieController.searchMoviesByTitle.bind(MovieController))
  .get('/search/director', MovieController.searchMoviesByDirector.bind(MovieController))
  .get('/reviews/:movieId', ReviewsController.getReviewsForMovie.bind(ReviewsController));