import L from '../../common/logger';
import { Client } from '@opensearch-project/opensearch';
import { MAX_RETURNED_RESULTS } from './opensearchReview.service';

export interface StatsAggregate {
  value: number | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export class OpenSearchUsersService {
  private client: Client;
  private index: string;
  // For simplicity, use an in‑memory counter for user IDs.
  private idCounter: number;

  constructor() {
    this.index = 'users';
    this.idCounter = 1;
    // Adjust node URL as needed.
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
              name: { type: 'text' },
              email: { type: 'keyword' }
            }
          }
        }
      });
      L.info(`Index ${this.index} created`, 'OpenSearchUsersService');
    } else {
      L.info(`Index ${this.index} already exists`, 'OpenSearchUsersService');
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

  async all(): Promise<User[]> {
    L.info("Fetching all users", "OpenSearchUsersService");
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
    return hits.map((hit: any) => hit._source as User);
  }

  // Retrieve a user by ID.
  async byId(id: number): Promise<User> {
    L.info(`Fetching user with id ${id}`, 'OpenSearchUsersService');
    try {
      const { body } = await this.client.get({
        index: this.index,
        id: id.toString()
      });
      return body._source as User;
    } catch (error) {
      L.error(`Error fetching user with id ${id}`, error, 'OpenSearchUsersService');
      throw error;
    }
  }

  // Create a new user.
  async create(userData: CreateUserRequest): Promise<User> {
    const user: User = {
      id: this.idCounter++,
      name: userData.name,
      email: userData.email
    };
    L.info(`Creating user: ${JSON.stringify(user)}`, 'OpenSearchUsersService');
    await this.client.index({
      index: this.index,
      id: user.id.toString(),
      body: user,
      refresh: 'wait_for'
    });
    return user;
  }

  // Update an existing user by ID.
  async update(id: number, partial: UpdateUserRequest): Promise<User | null> {
    try {
      const existing = await this.byId(id);
      if (!existing) {
        return null;
      }
      const updatedUser = { ...existing, ...partial };
      L.info(`Updating user with id ${id}: ${JSON.stringify(updatedUser)}`, 'OpenSearchUsersService');
      await this.client.index({
        index: this.index,
        id: id.toString(),
        body: updatedUser,
        refresh: 'wait_for'
      });
      return updatedUser;
    } catch (error) {
      L.error(`Error updating user with id ${id}`, error, 'OpenSearchUsersService');
      throw error;
    }
  }

  // Delete a user by ID.
  async delete(id: number): Promise<void> {
    try {
      L.info(`Deleting user with id ${id}`, 'OpenSearchUsersService');
      await this.client.delete({
        index: this.index,
        id: id.toString()
      });
      await this.client.indices.refresh({ index: this.index });
    } catch (error) {
      L.error(`Error deleting user with id ${id}`, error, 'OpenSearchUsersService');
      throw error;
    }
  }
}

export default new OpenSearchUsersService();
