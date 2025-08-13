// Temporary in-memory user storage
// In production, this should be replaced with database queries

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'DOG_OWNER' | 'FIELD_OWNER' | 'ADMIN';
  password: string;
  phone?: string;
  emailVerified: boolean;
  createdAt: string;
}

// Shared in-memory storage for demo purposes
// This will persist users during the current session
export const users: User[] = [];

export function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email);
}

export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'emailVerified'>): User {
  const newUser: User = {
    ...userData,
    id: `user_${Date.now()}`,
    createdAt: new Date().toISOString(),
    emailVerified: false,
  };
  users.push(newUser);
  return newUser;
}