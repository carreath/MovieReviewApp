import opensearchservice from '../../services/opensearchReview.service';
import { Request, Response } from 'express';

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

    /**
   * Add (create) a new review/document.
   */
    async addDocument(req: Request, res: Response): Promise<void> {
      try {
        // Typically, you'd validate these fields before calling the service.
        const { user, movieId, title, comment, rating } = req.body;
        const newReview = await opensearchservice.create({ user, movieId, title, comment, rating });
        res.status(201).json(newReview);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create review', details: error });
      }
    }
  
    /**
     * Edit (update) an existing review/document by ID.
     */
    async updateDocument(req: Request, res: Response): Promise<void> {
      try {
        const id = Number(req.params.id);
        const { user, title, comment, rating } = req.body;
        const updatedReview = await opensearchservice.update(id, { user, title, comment, rating });
  
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
