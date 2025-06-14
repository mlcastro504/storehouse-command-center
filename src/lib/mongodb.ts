
// Permite elegir entre modo MOCK y modo API REST real

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'; // Pon dirección backend aquí si no está en prod

let mode = localStorage.getItem("warehouseos_dbmode") || "mock"; // 'mock' o 'api'

export function setDbMode(newMode: "mock" | "api") {
  mode = newMode;
  localStorage.setItem("warehouseos_dbmode", newMode);
  window.location.reload(); // Recarga para asegurar todo hace fetch correctamente
}

export function getDbMode() {
  return mode;
}

if (mode === "mock") {
  // Importa el mock
  export {
    connectToDatabase,
    closeDatabaseConnection,
    getDatabaseStats,
    testConnection
  } from './mockMongoDB';
} else {
  // Implementación para producción con REST al backend
  export async function connectToDatabase(uri?: string, database?: string) {
    // No es necesario para backend, asume siempre conectado si responde el healthcheck
    const res = await fetch(`${BACKEND_URL}/api/health`);
    if (!res.ok) throw new Error("Cannot connect to backend API");
    return { dbApi: true }; // Dummy object
  }
  export async function closeDatabaseConnection() {
    return true;
  }
  export async function getDatabaseStats() {
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
  export async function testConnection(uri?: string, database?: string) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`);
      if (res.ok) return { success: true, message: "Backend reachable" };
      return { success: false, message: "Backend API unreachable" };
    } catch (e) {
      return { success: false, message: e.message || "API connection failed" };
    }
  }
}
