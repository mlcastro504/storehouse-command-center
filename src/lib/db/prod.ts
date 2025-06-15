
import { BACKEND_URL } from './config';
import { RestApiDatabaseProxy } from './restApiProxy';

// --- REST implementation for production ---
export async function prod_connectToDatabase(uri?: string, database?: string) {
  const res = await fetch(`${BACKEND_URL}/api/health`);
  if (!res.ok) throw new Error("Cannot connect to backend API");
  return new RestApiDatabaseProxy();
}

export async function prod_closeDatabaseConnection() {
  return true;
}

export async function prod_getDatabaseStats() {
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

export async function prod_testConnection(uri?: string, database?: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    if (res.ok) return { success: true, message: "Backend reachable" };
    return { success: false, message: "Backend API unreachable" };
  } catch (e: any) {
    return { success: false, message: e?.message || "API connection failed" };
  }
}

