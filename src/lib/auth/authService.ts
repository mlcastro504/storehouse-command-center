
import { User } from '@/types/warehouse';
import { getDbMode } from '@/lib/db/dbMode';
import { BACKEND_URL } from '@/lib/db/config';
import { fetchWithAuth } from '@/lib/db/apiAuth';
import { mockUsers, mockRoles } from '@/data/mock-auth';

// Helper to transform backend user to frontend user, using mockRoles for role mapping.
const transformBackendUser = (backendUser: any): User | null => {
  const roleObject = mockRoles.find(r => r.name === backendUser.role);
  if (!roleObject) {
    console.error(`Unknown role received from backend: ${backendUser.role}`);
    return null;
  }
  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    role: roleObject,
    isActive: backendUser.isActive,
    createdAt: new Date(backendUser.created_at),
    lastLoginAt: backendUser.updated_at ? new Date(backendUser.updated_at) : new Date(),
  };
};

export const restoreSession = async (): Promise<User | null> => {
  if (getDbMode() === 'api') {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const profileRes = await fetchWithAuth(`${BACKEND_URL}/api/profile`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.ok) {
          const user = transformBackendUser(profileData.data);
          if (user) {
            return user;
          }
        }
      }
      localStorage.removeItem('token');
      return null;
    } catch (error) {
      console.error('Failed to restore API session:', error);
      localStorage.removeItem('token');
      return null;
    }
  } else {
    // Mock session restoration
    const savedUser = localStorage.getItem('warehouseOS_user');
    const sessionExpiry = localStorage.getItem('warehouseOS_session_expiry');
    if (savedUser && sessionExpiry) {
      const now = new Date().getTime();
      if (now < parseInt(sessionExpiry)) {
        try {
          const parsedUser = JSON.parse(savedUser);
          const validUser = mockUsers.find(u => u.id === parsedUser.id && u.isActive);
          return validUser || null;
        } catch (error) {
          console.error('Error parsing saved user:', error);
        }
      }
      if (now >= parseInt(sessionExpiry)) {
        localStorage.removeItem('warehouseOS_user');
        localStorage.removeItem('warehouseOS_session_expiry');
      }
    }
    return null;
  }
};

export const login = async (email: string, password: string): Promise<User | null> => {
  if (getDbMode() === 'api') {
    try {
      const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok || !data.ok) {
        console.error('API Login failed:', data.error);
        return null;
      }
      
      localStorage.setItem('token', data.token);
      
      const profileRes = await fetchWithAuth(`${BACKEND_URL}/api/profile`);
      const profileData = await profileRes.json();
      
      if (!profileRes.ok || !profileData.ok) {
        localStorage.removeItem('token');
        return null;
      }

      const user = transformBackendUser(profileData.data);
      if(user) {
          user.lastLoginAt = new Date();
      }
      return user;

    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  } else {
    // Mock login logic
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser && foundUser.isActive && password === 'password123') {
      const updatedUser = { ...foundUser, lastLoginAt: new Date() };
      const sessionExpiry = new Date().getTime() + (24 * 60 * 60 * 1000);
      localStorage.setItem('warehouseOS_user', JSON.stringify(updatedUser));
      localStorage.setItem('warehouseOS_session_expiry', sessionExpiry.toString());
      return updatedUser;
    }
    return null;
  }
};

export const logout = (): void => {
  if (getDbMode() === 'api') {
    localStorage.removeItem('token');
  } else {
    localStorage.removeItem('warehouseOS_user');
    localStorage.removeItem('warehouseOS_session_expiry');
  }
};
