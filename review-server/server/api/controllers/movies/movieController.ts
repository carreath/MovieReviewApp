import { Request, Response } from 'express';
import opensearchMovieService from '../../services/opensearchMovie.service';

export class MovieController {
  /**
   * Get all movies.
   */
  async getMovies(_req: Request, res: Response): Promise<void> {
    try {
      const movies = await opensearchMovieService.all();
      res.status(200).json(movies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch movies', details: error });
    }
  }

  /**
   * Get a single movie by ID.
   */
  async getMovie(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const movie = await opensearchMovieService.byId(id);
      if (movie) {
        res.status(200).json(movie);
      } else {
        res.status(404).json({ message: `Movie with id ${id} not found` });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch movie', details: error });
    }
  }

  /**
   * Create a new movie.
   */
  async addMovie(req: Request, res: Response): Promise<void> {
    try {
      const movieData = req.body;
      const newMovie = await opensearchMovieService.create(movieData);
      res.status(201).json(newMovie);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create movie', details: error });
    }
  }

  /**
   * Update an existing movie.
   */
  async updateMovie(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const partial = req.body;
      const updatedMovie = await opensearchMovieService.update(id, partial);
      if (!updatedMovie) {
        res.status(404).json({ message: `Movie with id ${id} not found` });
      } else {
        res.status(200).json(updatedMovie);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update movie', details: error });
    }
  }

  /**
   * Bulk update movies
   */
  async bulkUpdateMovies(req: Request, res: Response): Promise<void> {
    try {
      const movies = req.body;
      const updatedMovies = await opensearchMovieService.bulkUpdate(movies);
      res.status(200).json(updatedMovies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to bulk update movies', details: error });
    }
  }

  /**
   * Delete a movie.
   */
  async deleteMovie(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      await opensearchMovieService.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete movie', details: error });
    }
  }

  /**
   * Search movies by title.
   */
  async searchMoviesByTitle(req: Request, res: Response): Promise<void> {
    try {
      const { title } = req.query;
      if (!title) {
        res.status(400).json({ message: "Title query parameter is required" });
      } else {
        const movies = await opensearchMovieService.searchByTitle(String(title));
        res.status(200).json(movies);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to search movies by title', details: error });
    }
  }

  /**
   * Search movies by director.
   */
  async searchMoviesByDirector(req: Request, res: Response): Promise<void> {
    try {
      const { director } = req.query;
      if (!director) {
        res.status(400).json({ message: "Director query parameter is required" });
      } else {
      const movies = await opensearchMovieService.searchByDirector(String(director));
      res.status(200).json(movies);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to search movies by director', details: error });
    }
  }
}

export default new MovieController();
