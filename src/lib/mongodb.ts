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
  constructor(private _collectionName: string, private _query?: any, private _sort?: any) {}
  sort(sortQuery: any) {
    this._sort = sortQuery;
    return this;
  }
  limit() {
    return this;
  }
  async toArray(): Promise<any[]> {
    // SOLO soportamos collection "ecommerce_connections" y query vacía/sort básico
    if (this._collectionName === 'ecommerce_connections') {
      const res = await fetch(`${BACKEND_URL}/api/ecommerce-connections`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "API error");
      // REST API retorna array
      return data.data;
    }
    throw new Error(
      `toArray() not implemented for collection '${this._collectionName}' in REST API mode.`
    );
  }
}

// --- Rest API Proxy Class ---
class RestApiDatabaseProxy {
  collection(name: string) {
    return {
      find: (query?: any) => new RestApiCursor(name, query),
      insertOne: async (doc: any) => {
        if (name === 'ecommerce_connections') {
          const res = await fetch(`${BACKEND_URL}/api/ecommerce-connections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doc),
          });
          const data = await res.json();
          if (!data.ok) throw new Error(data.error ?? "API error");
          return { insertedId: data.id };
        }
        throw new Error(`insertOne not implemented for collection '${name}' in REST API mode.`);
      },
      deleteOne: async (filter: any) => {
        if (name === 'ecommerce_connections' && filter?.id) {
          const res = await fetch(`${BACKEND_URL}/api/ecommerce-connections/${filter.id}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (!data.ok) throw new Error(data.error ?? "API error");
          return { deletedCount: 1 };
        }
        throw new Error(`deleteOne not implemented for collection '${name}' in REST API mode.`);
      },
      findOne: async () => {
        throw new Error(`collection('${name}').findOne(...) not implemented in REST API mode.`);
      },
      updateOne: async () => {
        throw new Error(`collection('${name}').updateOne(...) not implemented in REST API mode.`);
      },
      insertMany: async () => {
        throw new Error(`collection('${name}').insertMany(...) not implemented in REST API mode.`);
      },
      deleteMany: async () => {
        throw new Error(`collection('${name}').deleteMany(...) not implemented in REST API mode.`);
      },
      aggregate: async () => {
        throw new Error(`collection('${name}').aggregate(...) not implemented in REST API mode.`);
      },
      listIndexes: async () => {
        throw new Error(`collection('${name}').listIndexes(...) not implemented in REST API mode.`);
      }
    };
  }
  async listCollections(): Promise<any[]> {
    throw new Error("listCollections() not implemented in REST API mode.");
  }
  async stats(): Promise<any> {
    throw new Error("stats() not implemented in REST API mode.");
  }
  admin() {
    return {
      ping: async () => {
        throw new Error("admin().ping() not implemented in REST API mode.");
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
