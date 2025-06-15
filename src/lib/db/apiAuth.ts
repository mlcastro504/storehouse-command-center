
// Helper for adding Auth token to API requests

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  // This assumes the token is stored in localStorage with the key 'token'.
  return localStorage.getItem('token'); 
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getAuthToken();
    const headers = new Headers(options.headers || {});
    
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    return fetch(url, { ...options, headers });
}

