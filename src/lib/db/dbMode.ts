
// Manages the database mode ('mock' or 'api')

let mode = (typeof window !== "undefined" && localStorage.getItem("warehouseos_dbmode")) || "mock";

export function setDbMode(newMode: "mock" | "api") {
  mode = newMode;
  if (typeof window !== "undefined") {
    localStorage.setItem("warehouseos_dbmode", newMode);
    window.location.reload(); // Reload to ensure all parts of the app fetch data correctly
  }
}

export function getDbMode() {
  return mode;
}

