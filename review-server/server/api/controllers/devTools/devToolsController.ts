import openSearchMovieService from '../../services/opensearchMovie.service';
import opensearchService from '../../services/opensearchReview.service';
import devToolsService from '../../services/opensearchDevTools.service';
import opensearchUsersService from '../../services/opensearchUsers.service';
import { Request, Response } from 'express';

export class DevToolsController {
  async get(_req: Request, res: Response): Promise<void> {
    res.status(200).json({ message: 'DevToolsController' });
  }

  /**
   * Reinitialize the index by deleting and recreating it.
   */
  async reinitialize(_req: Request, res: Response): Promise<void> {
    try {
      await devToolsService.reinitializeIndex();
      await opensearchService.reinitializeIndex();
      await openSearchMovieService.reinitializeIndex();
      await opensearchUsersService.reinitializeIndex();
      res.status(200).json({ message: 'Index reinitialized successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reinitialize index', details: error });
    }
  }

  /**
   * Clear all documents in the index.
   */
  async clear(_req: Request, res: Response): Promise<void> {
    try {
      await devToolsService.clearIndex();
      res.status(200).json({ message: 'Index cleared successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear index', details: error });
    }
  }

  /**
   * Delete a specific document from the index by its ID.
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await devToolsService.deleteDocument(id);
      res.status(200).json({ message: `Document with id ${id} deleted successfully` });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete document', details: error });
    }
  }

  async addExampleReview(_req: Request, res: Response): Promise<void> {
    try {
      const exampleReviewData = {
        userId: 1,
        movieId: 1,
        title: "Example Review",
        comment: "This is an example review added via dev tools.",
        rating: 5
      };

      const review = await opensearchService.create(exampleReviewData);
      res.status(201).json({ message: "Example review added successfully", review });
    } catch (error) {
      res.status(500).json({ error: "Failed to add example review", details: error });
    }
  }
}

export default new DevToolsController();
