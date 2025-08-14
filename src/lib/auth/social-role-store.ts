// Simple in-memory store for pending social login roles
// This is used to pass the role from the registration form to the social login callback

class SocialRoleStore {
  private static instance: SocialRoleStore;
  private pendingRoles: Map<string, { role: string; timestamp: number }> = new Map();
  private readonly EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Clean up expired entries every minute
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanupExpired(), 60000);
    }
  }

  static getInstance(): SocialRoleStore {
    if (!SocialRoleStore.instance) {
      SocialRoleStore.instance = new SocialRoleStore();
    }
    return SocialRoleStore.instance;
  }

  setPendingRole(email: string, role: 'DOG_OWNER' | 'FIELD_OWNER') {
    this.pendingRoles.set(email.toLowerCase(), {
      role,
      timestamp: Date.now()
    });
  }

  getPendingRole(email: string): string | null {
    const entry = this.pendingRoles.get(email.toLowerCase());
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.EXPIRY_TIME) {
      this.pendingRoles.delete(email.toLowerCase());
      return null;
    }

    return entry.role;
  }

  clearPendingRole(email: string) {
    this.pendingRoles.delete(email.toLowerCase());
  }

  private cleanupExpired() {
    const now = Date.now();
    for (const [email, entry] of this.pendingRoles.entries()) {
      if (now - entry.timestamp > this.EXPIRY_TIME) {
        this.pendingRoles.delete(email);
      }
    }
  }
}

export const socialRoleStore = SocialRoleStore.getInstance();