
import { fetchWithAuth } from './apiAuth';
import { BACKEND_URL } from './config';

// --- Chainable Cursor for REST API Proxy ---
class RestApiCursor {
  private queryParams: URLSearchParams;

  constructor(private _collectionName: string, private _query: any = {}) {
    this.queryParams = new URLSearchParams();
    if (_query) {
      Object.entries(_query).forEach(([key, value]) => {
        if (key === '$in' || typeof value === 'object') {
          console.warn(`Complex query for key '${key}' not supported in REST API mode yet.`);
        } else if (value !== undefined && value !== null) {
          this.queryParams.append(key, String(value));
        }
      });
    }
  }

  sort(sortQuery: any) {
    // TODO: Implement sort param if API supports it
    return this;
  }

  limit() {
    // TODO: Implement limit param if API supports it
    return this;
  }

  async toArray(): Promise<any[]> {
    const queryString = this.queryParams.toString();
    const url = `${BACKEND_URL}/api/${this._collectionName}${queryString ? '?' + queryString : ''}`;
    const res = await fetchWithAuth(url);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error ?? `API error: ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.ok) throw new Error(data.error ?? "API error");
    return data.data;
  }
}

// --- Rest API Proxy Class ---
export class RestApiDatabaseProxy {
  collection(name: string) {
    const collectionName = name;
    return {
      find: (query?: any) => new RestApiCursor(collectionName, query),
      
      insertOne: async (doc: any) => {
        const res = await fetchWithAuth(`${BACKEND_URL}/api/${collectionName}`, {
          method: 'POST',
          body: JSON.stringify(doc),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error ?? "API error");
        return { insertedId: data.data._id, acknowledged: true };
      },

      updateOne: async (filter: any, update: any) => {
        const id = filter.id || filter._id;
        if (!id) throw new Error("Update requires an 'id' or '_id' in the filter for REST API mode.");
        
        const payload = update.$set || update; // common case

        const res = await fetchWithAuth(`${BACKEND_URL}/api/${collectionName}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error ?? "API error");
        return { matchedCount: 1, modifiedCount: 1, acknowledged: true };
      },
      
      deleteOne: async (filter: any) => {
        const id = filter.id || filter._id;
        if (!id) throw new Error("Delete requires an 'id' or '_id' in the filter for REST API mode.");

        const res = await fetchWithAuth(`${BACKEND_URL}/api/${collectionName}/${id}`, {
          method: 'DELETE',
        });
        if (res.status === 404) {
            return { deletedCount: 0, acknowledged: true };
        }
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Failed to parse error response' }));
            throw new Error(errorData.error ?? `API error: ${res.statusText}`);
        }
        return { deletedCount: 1, acknowledged: true };
      },
      
      findOne: async (filter: any) => {
        const cursor = new RestApiCursor(collectionName, filter);
        const results = await cursor.toArray();
        return results[0] || null;
      },
      
      insertMany: async (docs: any[]) => {
        // This can be optimized with a dedicated backend endpoint later
        for (const doc of docs) {
          await this.collection(collectionName).insertOne(doc);
        }
        return { acknowledged: true, insertedCount: docs.length };
      },

      deleteMany: async (filter: any) => {
        if (Object.keys(filter).length === 0) {
            console.warn("Attempted to delete all documents in a collection via API mode. This is not enabled for safety.");
            return { deletedCount: 0, acknowledged: false };
        }
        throw new Error(`collection('${collectionName}').deleteMany(...) with filters is not implemented in REST API mode.`);
      },
      aggregate: async () => {
        throw new Error(`collection('${collectionName}').aggregate(...) not implemented in REST API mode.`);
      },
      listIndexes: async () => {
        return { toArray: async () => [] };
      }
    };
  }
  async listCollections(): Promise<any[]> {
    throw new Error("listCollections() not implemented in REST API mode.");
  }
  async stats(): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/db-stats`);
    if (!res.ok) return { collections: 0, dataSize: 0, storageSize: 0, indexes: 0 };
    const data = await res.json();
    return data.ok ? data.stats : { collections: 0, dataSize: 0, storageSize: 0, indexes: 0 };
  }
  admin() {
    return {
      ping: async () => {
        const res = await fetch(`${BACKEND_URL}/api/health`);
        return { ok: res.ok ? 1 : 0 };
      }
    };
  }
}

