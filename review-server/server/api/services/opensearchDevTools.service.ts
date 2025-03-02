import L from '../../common/logger';
import { Client } from '@opensearch-project/opensearch';

export class OpenSearchDevToolsService {
  private client: Client;
  private index: string;

  constructor() {
    // The index name should match the one used for storing reviews.
    this.index = 'reviews';
    this.client = new Client({ node: 'http://localhost:9200' });
  }

  /**
   * Reinitialize the index.
   * This method deletes the index (if it exists) and recreates it with the proper mappings.
   */
  async reinitializeIndex(): Promise<void> {
    L.info(`Reinitializing index ${this.index}`, 'OpenSearchDevTools');
    try {
      // Delete the index if it exists.
      const existsResponse = await this.client.indices.exists({ index: this.index });
      if (existsResponse.body) {
        await this.client.indices.delete({ index: this.index });
        L.info(`Deleted index ${this.index}`, 'OpenSearchDevTools');
      }
      // Recreate the index with proper mappings.
      await this.client.indices.create({
        index: this.index,
        body: {
          mappings: {
            properties: {
              id: { type: 'integer' },
              user: { type: 'keyword' },
              title: { type: 'text' },
              comment: { type: 'text' },
              rating: { type: 'integer' },
              date: { type: 'date' }
            }
          }
        }
      });
      L.info(`Recreated index ${this.index}`, 'OpenSearchDevTools');
    } catch (error) {
      L.error(`Error reinitializing index ${this.index}`, error, 'OpenSearchDevTools');
      throw error;
    }
  }

  /**
   * Clear the index by deleting all documents.
   */
  async clearIndex(): Promise<void> {
    L.info(`Clearing all documents in index ${this.index}`, 'OpenSearchDevTools');
    try {
      // Delete all documents with a match_all query.
      const response = await this.client.deleteByQuery({
        index: this.index,
        body: {
          query: {
            match_all: {}
          }
        },
        refresh: true  // ensures that the changes are visible immediately
      });
      L.info(`Cleared index: ${JSON.stringify(response.body)}`, 'OpenSearchDevTools');
    } catch (error) {
      L.error(`Error clearing index ${this.index}`, error, 'OpenSearchDevTools');
      throw error;
    }
  }

  /**
   * Delete a single document from the index by its ID.
   * @param id The ID of the document to delete.
   */
  async deleteDocument(id: number): Promise<void> {
    L.info(`Deleting document with id ${id} from index ${this.index}`, 'OpenSearchDevTools');
    try {
      await this.client.delete({
        index: this.index,
        id: id.toString()
      });
      // Refresh to make sure the deletion is visible.
      await this.client.indices.refresh({ index: this.index });
      L.info(`Deleted document with id ${id}`, 'OpenSearchDevTools');
    } catch (error) {
      L.error(`Error deleting document with id ${id}`, error, 'OpenSearchDevTools');
      throw error;
    }
  }
}

export default new OpenSearchDevToolsService();
