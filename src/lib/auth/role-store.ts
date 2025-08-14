// Server-side role storage using a simple in-memory cache
// In production, you might want to use Redis or another persistent storage

interface RoleEntry {
  role: 'DOG_OWNER' | 'FIELD_OWNER';
  timestamp: number;
  email?: string;
}

class RoleStore {
  private store: Map<string, RoleEntry> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  // Generate a unique key for the user session
  generateKey(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Store role with a key
  setRole(key: string, role: 'DOG_OWNER' | 'FIELD_OWNER', email?: string): void {
    this.store.set(key, {
      role,
      email,
      timestamp: Date.now(),
    });
    
    // Clean up old entries
    this.cleanup();
  }

  // Get role by key
  getRole(key: string): string | null {
    const entry = this.store.get(key);
    
    if (!entry) return null;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.store.delete(key);
      return null;
    }
    
    return entry.role;
  }

  // Get role by email (fallback method)
  getRoleByEmail(email: string): string | null {
    for (const [key, entry] of this.store.entries()) {
      if (entry.email === email && Date.now() - entry.timestamp <= this.TTL) {
        return entry.role;
      }
    }
    return null;
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.store.delete(key);
      }
    }
  }
}

// Create a singleton instance
export const roleStore = new RoleStore();