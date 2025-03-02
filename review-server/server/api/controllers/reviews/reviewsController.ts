import opensearchservice from '../../services/opensearchReview.service';
import { Request, Response } from 'express';
import filter from 'no-profanity';

export class ReviewsController {
  /**
   * Endpoint to get all reviews/documents.
   */
  async getDocuments(_req: Request, res: Response): Promise<void> {
    try {
      const reviews = await opensearchservice.all();
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reviews', details: error });
    }
  }

  /**
   * Endpoint to get a single review/document by its ID.
   */
  async getDocument(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const review = await opensearchservice.byId(id);
      if (review) {
        res.status(200).json(review);
      } else {
        res.status(404).json({ message: `Review with id ${id} not found` });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch review', details: error });
    }
  }

  async addDocument(req: Request, res: Response): Promise<void> {
    try {
      const { userId, movieId, comment, rating } = req.body;
      
      // Clean the comment using no-profanity package.
      const cleanedComment = filter.replaceProfanities(comment);

      // Search for an existing review for the given movie.
      const reviewsForMovie = await opensearchservice.searchByMovie(movieId);
      const existingReview = reviewsForMovie.find((r) => r.userId === userId);

      if (existingReview) {
        // Update the existing review.
        const updatedReview = await opensearchservice.update(existingReview.id, { comment: cleanedComment, rating });
        res.status(200).json(updatedReview);
      } else {
        // Create a new review.
        const newReview = await opensearchservice.create({ userId, movieId, comment: cleanedComment, rating });
        res.status(201).json(newReview);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to create or update review', details: error });
    }
  }

  
    /**
     * Edit (update) an existing review/document by ID.
     */
    async updateDocument(req: Request, res: Response): Promise<void> {
      try {
        const id = Number(req.params.id);
        const { comment, rating } = req.body;
        const updatedReview = await opensearchservice.update(id, { comment, rating });
  
        if (!updatedReview) {
          res.status(404).json({ message: `Review with id ${id} not found` });
        } else {
          res.status(200).json(updatedReview);
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to update review', details: error });
      }
    }
  
    /**
     * Delete an existing review/document by ID.
     */
    async deleteDocument(req: Request, res: Response): Promise<void> {
      try {
        const id = Number(req.params.id);
        await opensearchservice.delete(id);
        // 204 No Content indicates the resource was deleted successfully.
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete review', details: error });
      }
    }

    async getReviewsForMovie(req: Request, res: Response): Promise<void> {
      try {
        const movieId = Number(req.params.movieId);
        const reviews = await opensearchservice.searchByMovie(movieId);
        res.status(200).json(reviews);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews for movie', details: error });
      }
    }
}

export default new ReviewsController();
