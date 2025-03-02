import L from '../../common/logger';
import { Client } from '@opensearch-project/opensearch';
import { StatsAggregate } from './opensearchUsers.service';
import { MAX_RETURNED_RESULTS } from './opensearchReview.service';

// Define the Movie interface.
export interface Movie {
  id: number;
  title: string;
  director: string;
  releaseDate: string; // ISO date string
  genre: string;
  description: string;
  rating?: number;
}

// Define the structure for creating a new movie.
export interface CreateMovieRequest {
  title: string;
  director: string;
  releaseDate: string;
  genre: string;
  description: string;
  rating?: number;
}

export class OpenSearchMovieService {
  private client: Client;
  private index: string;
  // For simplicity we use an in‑memory counter for movie IDs.
  // In a production system you might let OpenSearch generate IDs.
  private idCounter: number;

  constructor() {
    this.index = 'movies';
    this.idCounter = 1;
    // Adjust the node URL as needed.
    this.client = new Client({ node: 'http://localhost:9200' });
    this.initializeIndex();
  }

  // Create the index with appropriate mappings if it doesn't exist.
  private async initializeIndex(): Promise<void> {
    const existsResponse = await this.client.indices.exists({ index: this.index });
    if (!existsResponse.body) {
      await this.client.indices.create({
        index: this.index,
        body: {
          mappings: {
            properties: {
              id: { type: 'integer' },
              title: { type: 'text' },
              director: { type: 'keyword' },
              releaseDate: { type: 'date' },
              genre: { type: 'keyword' },
              description: { type: 'text' },
              rating: { type: 'float' }
            }
          }
        }
      });
      L.info(`Index ${this.index} created`, 'OpenSearchMoviesService');
    } else {
      L.info(`Index ${this.index} already exists`, 'OpenSearchMoviesService');
    }

    try {
      // Use aggregation to compute the maximum value of the "id" field.
      const { body } = await this.client.search({
        index: this.index,
        size: 0,
        body: {
          aggs: {
            maxId: {
              max: {
                field: "id"
              }
            }
          }
        }
      });

      // Cast the aggregation result to StatsAggregate to access the "value" property.
      const maxIdAgg = body.aggregations?.maxId as StatsAggregate;
      const maxId = maxIdAgg?.value || 0;
      this.idCounter = maxId + 1;
      L.info(`User ID counter set to ${this.idCounter}`, 'OpenSearchUsersService');
    } catch (error) {
      L.error("Error retrieving current max user id", error, 'OpenSearchUsersService');
    }
  }

  async reinitializeIndex(): Promise<void> {
    L.info(`Reinitializing index ${this.index}`, 'OpenSearchDevTools');
    try {
      // Delete the index if it exists.
      const existsResponse = await this.client.indices.exists({ index: this.index });
      if (existsResponse.body) {
        await this.client.indices.delete({ index: this.index });
        L.info(`Deleted index ${this.index}`, 'OpenSearchDevTools');
      }

      await this.initializeIndex();
      L.info(`Recreated index ${this.index}`, 'OpenSearchDevTools');
    } catch (error) {
      L.error(`Error reinitializing index ${this.index}`, error, 'OpenSearchDevTools');
      throw error;
    }
  }

  // Retrieve all movies using a match_all query.
  async all(): Promise<Movie[]> {
    L.info('Fetching all movies', 'OpenSearchMoviesService');
    const { body } = await this.client.search({
      index: this.index,
      size: MAX_RETURNED_RESULTS,
      body: {
        query: {
          match_all: {}
        }
      }
    });
    const hits = body.hits.hits;
    return hits.map((hit: any) => hit._source as Movie);
  }

  // Retrieve a single movie by its ID.
  async byId(id: number): Promise<Movie> {
    L.info(`Fetching movie with id ${id}`, 'OpenSearchMoviesService');
    try {
      const { body } = await this.client.get({
        index: this.index,
        id: id.toString()
      });
      return body._source as Movie;
    } catch (error) {
      L.error(`Error fetching movie with id ${id}`, error, 'OpenSearchMoviesService');
      throw error;
    }
  }

  // Create a new movie and index it in OpenSearch.
  async create(movieData: CreateMovieRequest): Promise<Movie> {
    const movie: Movie = {
      id: this.idCounter++,
      title: movieData.title,
      director: movieData.director,
      releaseDate: movieData.releaseDate,
      genre: movieData.genre,
      description: movieData.description,
      rating: movieData.rating
    };

    L.info(`Creating movie: ${JSON.stringify(movie)}`, 'OpenSearchMoviesService');
    await this.client.index({
      index: this.index,
      id: movie.id.toString(),
      body: movie,
      refresh: 'wait_for' // ensures the document is searchable immediately
    });
    return movie;
  }

  // Update an existing movie by ID.
  async update(id: number, partial: Partial<Movie>): Promise<Movie | null> {
    try {
      const existing = await this.byId(id);
      if (!existing) {
        return null;
      }

      // Merge existing fields with new partial data.
      const updatedMovie = { ...existing, ...partial };

      L.info(`Updating movie with id ${id}: ${JSON.stringify(updatedMovie)}`, 'OpenSearchMoviesService');
      await this.client.index({
        index: this.index,
        id: id.toString(),
        body: updatedMovie,
        refresh: 'wait_for'
      });

      return updatedMovie;
    } catch (error) {
      L.error(`Error updating movie with id ${id}`, error, 'OpenSearchMoviesService');
      throw error;
    }
  }

  // Delete a movie by ID.
  async delete(id: number): Promise<void> {
    try {
      L.info(`Deleting movie with id ${id}`, 'OpenSearchMoviesService');
      await this.client.delete({
        index: this.index,
        id: id.toString()
      });
      await this.client.indices.refresh({ index: this.index });
    } catch (error) {
      L.error(`Error deleting movie with id ${id}`, error, 'OpenSearchMoviesService');
      throw error;
    }
  }

  // Search for movies by title.
  async searchByTitle(title: string): Promise<Movie[]> {
    L.info(`Searching movies by title: ${title}`, 'OpenSearchMoviesService');
    const { body } = await this.client.search({
      index: this.index,
      size: MAX_RETURNED_RESULTS,
      body: {
        query: {
          match: { title }
        }
      }
    });
    const hits = body.hits.hits;
    return hits.map((hit: any) => hit._source as Movie);
  }

  // Search for movies by director.
  async searchByDirector(director: string): Promise<Movie[]> {
    L.info(`Searching movies by director: ${director}`, 'OpenSearchMoviesService');
    const { body } = await this.client.search({
      index: this.index,
      size: MAX_RETURNED_RESULTS,
      body: {
        query: {
          term: { director }
        }
      }
    });
    const hits = body.hits.hits;
    return hits.map((hit: any) => hit._source as Movie);
  }
}

export default new OpenSearchMovieService();
