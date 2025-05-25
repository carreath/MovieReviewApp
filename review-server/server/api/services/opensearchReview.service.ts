import L from '../../common/logger';
import { Client } from '@opensearch-project/opensearch';
import { StatsAggregate } from './opensearchUsers.service';

export const MAX_RETURNED_RESULTS = 1000;

// Define the Review interface.
export interface Review {
  id: number;
  movieId: number;
  userId: number;
  comment: string;
  rating: number;
  date: string;
}

export interface ReviewsAggregationResult {
  totalReviews: number;
  reviewsByMovie: { movieId: number; reviewCount: number }[];
}


// Define the structure for creating a new review.
export interface CreateReviewRequest {
  movieId: number;
  userId: number;
  comment: string;
  rating: number;
}

export class OpenSearchReviewsService {
  private client: Client;
  private index: string;
  // For simplicity we use an in‑memory counter for review IDs.
  // In a production system you might let OpenSearch generate IDs.
  private idCounter: number;

  constructor() {
    this.index = 'reviews';
    this.idCounter = 1;
    // Adjust the node URL as needed.
    this.client = new Client({ node: 'http://localhost:9200' });
    this.initializeIndex();
  }

  private async initializeIndex(): Promise<void> {
    const existsResponse = await this.client.indices.exists({ index: this.index });
    if (!existsResponse.body) {
      await this.client.indices.create({
        index: this.index,
        body: {
          mappings: {
            properties: {
              id: { type: 'integer' },
              movieId: { type: 'integer' },
              userId: { type: 'integer' },
              title: { type: 'text' },
              comment: { type: 'text' },
              rating: { type: 'integer' },
              date: { type: 'date' }
            }
          }
        }
      });
      
      L.info(`Index ${this.index} created`, 'OpenSearch');
    } else {
      L.info(`Index ${this.index} already exists`, 'OpenSearch');
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
      L.info(`Review ID counter set to ${this.idCounter}`, 'OpenSearchUsersService');
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

  // Retrieve all reviews using a match_all query.
  async all(): Promise<Review[]> {
    L.info('Fetching all reviews', 'OpenSearch');
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
    return hits.map((hit: any) => hit._source as Review);
  }

  // Retrieve a single review by its ID.
  async byId(id: number): Promise<Review> {
    L.info(`Fetching review with id ${id}`, 'OpenSearch');
    try {
      const { body } = await this.client.get({
        index: this.index,
        id: id.toString()
      });
      return body._source as Review;
    } catch (error) {
      L.error(`Error fetching review with id ${id}`, error, 'OpenSearch');
      throw error;
    }
  }

  // Create a new review and index it in OpenSearch.
  async create(reviewData: CreateReviewRequest): Promise<Review> {
    // Use the in‑memory counter to assign a sequential ID.
    const id = this.idCounter++;
    const review: Review = {
      id,
      userId: reviewData.userId,
      movieId: reviewData.movieId,  
      comment: reviewData.comment,
      rating: reviewData.rating,
      date: new Date().toISOString(),
    };
  
    L.info(`Creating review: ${JSON.stringify(review)}`, 'OpenSearch');
    
    await this.client.index({
      index: this.index,
      id: id.toString(), // supply the id so ES uses it as document id
      body: review,
      refresh: 'wait_for', // ensures the document is searchable immediately
    });
    
    return review;
  }

  // Search for reviews submitted by a specific user.
  async searchByUser(userId: number): Promise<Review[]> {
    L.info(`Searching reviews by userId: ${userId}`, 'OpenSearch');
    const { body } = await this.client.search({
      index: this.index,
      size: MAX_RETURNED_RESULTS,
      body: {
        query: {
          term: {
            userId // since 'user' is mapped as keyword, this ensures an exact match
          }
        }
      }
    });
    const hits = body.hits.hits;
    return hits.map((hit: any) => hit._source as Review);
  }

  async searchByMovie(movieId: number): Promise<Review[]> {
    L.info(`Searching reviews for movieId: ${movieId}`, 'OpenSearch');
    const { body } = await this.client.search({
      index: this.index,
      size: MAX_RETURNED_RESULTS,
      body: {
        query: {
          term: { movieId }
        }
      }
    });
    const hits = body.hits.hits;
    return hits.map((hit: any) => hit._source as Review);
  }

  // Search for reviews by keywords within the title and comment fields.
  async searchByKeywords(keywords: string): Promise<Review[]> {
    L.info(`Searching reviews by keywords: ${keywords}`, 'OpenSearch');
    const { body } = await this.client.search({
      index: this.index,
      size: MAX_RETURNED_RESULTS,
      body: {
        query: {
          multi_match: {
            query: keywords,
            fields: ['title', 'comment']
          }
        }
      }
    });
    const hits = body.hits.hits;
    L.info(`Found ${hits.length} reviews`, 'OpenSearch');
    return hits.map((hit: any) => hit._source as Review);
  }

  /**
   * Update an existing review by ID.
   * Returns the updated review, or null if not found.
   */
  async update(id: number, partial: Partial<Review>): Promise<Review | null> {
    // First, check if the document exists
    try {
      const existing = await this.byId(id);
      if (!existing) {
        return null;
      }

      // Merge existing fields with new partial data
      const updatedReview = { ...existing, ...partial };

      L.info(`Updating review with id ${id}: ${JSON.stringify(updatedReview)}`, 'OpenSearch');

      await this.client.index({
        index: this.index,
        id: id.toString(),
        body: updatedReview,
        refresh: 'wait_for',
      });

      return updatedReview;
    } catch (error) {
      L.error(`Error updating review with id ${id}`, error, 'OpenSearch');
      throw error;
    }
  }

  /**
   * Delete a review by ID.
   */
  async delete(id: number): Promise<void> {
    try {
      L.info(`Deleting review with id ${id}`, 'OpenSearch');
      await this.client.delete({
        index: this.index,
        id: id.toString(),
      });
      await this.client.indices.refresh({ index: this.index });
    } catch (error) {
      L.error(`Error deleting review with id ${id}`, error, 'OpenSearch');
      throw error;
    }
  }
}

export default new OpenSearchReviewsService();
