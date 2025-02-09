/**
 * In-Memory Store Implementation for Rate Limiting
 * Used in development and testing environments
 */

import { Store, ClientRateLimitInfo } from 'express-rate-limit';

class MemoryStore implements Store {
  private static instance: MemoryStore;
  private store: Map<string, { hits: number; resetTime: Date }>;

  private constructor() {
    this.store = new Map();
  }

  public static getInstance(): MemoryStore {
    if (!MemoryStore.instance) {
      MemoryStore.instance = new MemoryStore();
    }
    return MemoryStore.instance;
  }

  async increment(key: string): Promise<ClientRateLimitInfo> {
    const now = new Date();
    const record = this.store.get(key);

    if (!record || record.resetTime <= now) {
      const resetTime = new Date(now.getTime() + 60000); // 1 minute window
      this.store.set(key, {
        hits: 1,
        resetTime,
      });
      return {
        totalHits: 1,
        resetTime,
      };
    }

    // Update existing record
    const updatedHits = record.hits + 1;
        
    this.store.set(key, {
      hits: updatedHits,
      resetTime: record.resetTime,
    });

    return {
      totalHits: updatedHits,
      resetTime: record.resetTime,
    };
  }

  async decrement(key: string): Promise<void> {
    const record = this.store.get(key);
    if (record && record.hits > 0) {
      this.store.set(key, {
        hits: record.hits - 1,
        resetTime: record.resetTime,
      });
    }
  }

  async resetKey(key: string): Promise<void> {
    this.store.delete(key);
  }

  async resetAll(): Promise<void> {
    this.store.clear();
  }
}

export { MemoryStore };