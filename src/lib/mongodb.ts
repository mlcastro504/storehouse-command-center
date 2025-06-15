
// Permite elegir entre modo MOCK y modo API REST real

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'; // Pon dirección backend aquí si no está en prod

let mode = (typeof window !== "undefined" && localStorage.getItem("warehouseos_dbmode")) || "mock"; // 'mock' o 'api'

export function setDbMode(newMode: "mock" | "api") {
  mode = newMode;
  if (typeof window !== "undefined") {
    localStorage.setItem("warehouseos_dbmode", newMode);
    window.location.reload(); // Recarga para asegurar todo hace fetch correctamente
  }
}

export function getDbMode() {
  return mode;
}

// --- Importa ambas implementaciones al tope ---

import * as mock from './mockMongoDB';

// --- Chainable Cursor for REST API Proxy ---
class RestApiCursor {
  private queryParams: URLSearchParams;

  constructor(private _collectionName: string, private _query: any = {}) {
    this.queryParams = new URLSearchParams();
    if (_query) {
      Object.entries(_query).forEach(([key, value]) => {
        if (key === '$in' || typeof value === 'object') {
          // More complex queries not supported yet via GET params.
          // This would need a POST endpoint for queries.
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
    const res = await fetch(url);
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
class RestApiDatabaseProxy {
  collection(name: string) {
    const collectionName = name;
    return {
      find: (query?: any) => new RestApiCursor(collectionName, query),
      
      insertOne: async (doc: any) => {
        const res = await fetch(`${BACKEND_URL}/api/${collectionName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

        const res = await fetch(`${BACKEND_URL}/api/${collectionName}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error ?? "API error");
        return { matchedCount: 1, modifiedCount: 1, acknowledged: true };
      },
      
      deleteOne: async (filter: any) => {
        const id = filter.id || filter._id;
        if (!id) throw new Error("Delete requires an 'id' or '_id' in the filter for REST API mode.");

        const res = await fetch(`${BACKEND_URL}/api/${collectionName}/${id}`, {
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
        // A proper implementation needs a dedicated backend endpoint that accepts a query body.
        if (Object.keys(filter).length === 0) {
            console.warn("Attempted to delete all documents in a collection via API mode. This is not enabled for safety. Please clear data from mock mode or manually in your DB.");
            return { deletedCount: 0, acknowledged: false };
        }
        throw new Error(`collection('${collectionName}').deleteMany(...) with filters is not implemented in REST API mode.`);
      },
      aggregate: async () => {
        throw new Error(`collection('${collectionName}').aggregate(...) not implemented in REST API mode.`);
      },
      listIndexes: async () => {
        // Mocking this to avoid errors in some libraries
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

// --- Implementación REST (para producción) ---
async function prod_connectToDatabase(uri?: string, database?: string) {
  // No es necesario para backend, asume siempre conectado si responde el healthcheck
  const res = await fetch(`${BACKEND_URL}/api/health`);
  if (!res.ok) throw new Error("Cannot connect to backend API");
  return new RestApiDatabaseProxy();
}
async function prod_closeDatabaseConnection() {
  return true;
}
async function prod_getDatabaseStats() {
  const res = await fetch(`${BACKEND_URL}/api/db-stats`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Error getting stats");
  return {
    collections: data.stats.collections,
    dataSize: data.stats.dataSize,
    storageSize: data.stats.storageSize,
    indexes: data.stats.indexes
  };
}
async function prod_testConnection(uri?: string, database?: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    if (res.ok) return { success: true, message: "Backend reachable" };
    return { success: false, message: "Backend API unreachable" };
  } catch (e: any) {
    return { success: false, message: e?.message || "API connection failed" };
  }
}

// --- Forwarders: usan mock o prod segun modo ---
export const connectToDatabase = (...args: Parameters<typeof mock.connectToDatabase>) =>
  getDbMode() === "mock" ? mock.connectToDatabase(...args) : prod_connectToDatabase(...args);

export const closeDatabaseConnection = (...args: Parameters<typeof mock.closeDatabaseConnection>) =>
  getDbMode() === "mock" ? mock.closeDatabaseConnection(...args) : prod_closeDatabaseConnection(...args);

export const getDatabaseStats = (...args: Parameters<typeof mock.getDatabaseStats>) =>
  getDbMode() === "mock" ? mock.getDatabaseStats(...args) : prod_getDatabaseStats(...args);

export const testConnection = (...args: Parameters<typeof mock.testConnection>) =>
  getDbMode() === "mock" ? mock.testConnection(...args) : prod_testConnection(...args);

// Fin
