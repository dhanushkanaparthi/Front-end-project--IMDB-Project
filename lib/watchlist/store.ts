import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { BroadcastChannel } from 'broadcast-channel';

interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id: string;
  added_at: string;
  notes: string | null;
  priority: number;
  watched: boolean;
  watched_at: string | null;
  client_id: string;
  vector_clock: Record<string, number>;
  sync_version: number;
  is_deleted: boolean;
  updated_at: string;
}

interface WatchlistDB extends DBSchema {
  watchlist: {
    key: string;
    value: WatchlistItem;
    indexes: { 'by-movie': string; 'by-sync': number };
  };
  pending_sync: {
    key: string;
    value: {
      id: string;
      operation: 'add' | 'update' | 'delete';
      data: WatchlistItem;
      timestamp: number;
    };
  };
}

const CLIENT_ID = typeof window !== 'undefined'
  ? localStorage.getItem('client-id') || (() => {
      const id = `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('client-id', id);
      return id;
    })()
  : '';

class WatchlistStore {
  private db: IDBPDatabase<WatchlistDB> | null = null;
  private channel: BroadcastChannel<{ type: string; data: any }> | null = null;
  private syncInProgress = false;

  async init() {
    if (typeof window === 'undefined') return;

    this.db = await openDB<WatchlistDB>('watchlist-db', 1, {
      upgrade(db) {
        const watchlistStore = db.createObjectStore('watchlist', { keyPath: 'id' });
        watchlistStore.createIndex('by-movie', 'movie_id');
        watchlistStore.createIndex('by-sync', 'sync_version');

        db.createObjectStore('pending_sync', { keyPath: 'id' });
      },
    });

    this.channel = new BroadcastChannel('watchlist-sync');
    this.channel.addEventListener('message', (msg) => {
      if (msg.type === 'update') {
        window.dispatchEvent(new CustomEvent('watchlist-update', { detail: msg.data }));
      }
    });
  }

  private incrementVectorClock(clock: Record<string, number>): Record<string, number> {
    return {
      ...clock,
      [CLIENT_ID]: (clock[CLIENT_ID] || 0) + 1,
    };
  }

  private mergeVectorClocks(
    clock1: Record<string, number>,
    clock2: Record<string, number>
  ): Record<string, number> {
    const allKeys = new Set([...Object.keys(clock1), ...Object.keys(clock2)]);
    const merged: Record<string, number> = {};

    allKeys.forEach((key) => {
      merged[key] = Math.max(clock1[key] || 0, clock2[key] || 0);
    });

    return merged;
  }

  private compareVectorClocks(
    clock1: Record<string, number>,
    clock2: Record<string, number>
  ): 'before' | 'after' | 'concurrent' {
    let hasLess = false;
    let hasGreater = false;

    const allKeys = new Set([...Object.keys(clock1), ...Object.keys(clock2)]);

    allKeys.forEach((key) => {
      const v1 = clock1[key] || 0;
      const v2 = clock2[key] || 0;

      if (v1 < v2) hasLess = true;
      if (v1 > v2) hasGreater = true;
    });

    if (hasLess && !hasGreater) return 'before';
    if (hasGreater && !hasLess) return 'after';
    return 'concurrent';
  }

  async add(movieId: string, userId: string, notes?: string): Promise<WatchlistItem> {
    if (!this.db) await this.init();

    const existing = await this.getByMovie(movieId);
    if (existing && !existing.is_deleted) {
      throw new Error('Movie already in watchlist');
    }

    const item: WatchlistItem = {
      id: existing?.id || `wl-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      user_id: userId,
      movie_id: movieId,
      added_at: new Date().toISOString(),
      notes: notes || null,
      priority: 0,
      watched: false,
      watched_at: null,
      client_id: CLIENT_ID,
      vector_clock: this.incrementVectorClock(existing?.vector_clock || {}),
      sync_version: (existing?.sync_version || 0) + 1,
      is_deleted: false,
      updated_at: new Date().toISOString(),
    };

    await this.db!.put('watchlist', item);
    await this.db!.put('pending_sync', {
      id: `sync-${Date.now()}`,
      operation: 'add',
      data: item,
      timestamp: Date.now(),
    });

    this.channel?.postMessage({ type: 'update', data: item });
    this.triggerSync();

    return item;
  }

  async update(id: string, updates: Partial<WatchlistItem>): Promise<WatchlistItem> {
    if (!this.db) await this.init();

    const existing = await this.db!.get('watchlist', id);
    if (!existing) {
      throw new Error('Watchlist item not found');
    }

    const updated: WatchlistItem = {
      ...existing,
      ...updates,
      vector_clock: this.incrementVectorClock(existing.vector_clock),
      sync_version: existing.sync_version + 1,
      updated_at: new Date().toISOString(),
    };

    await this.db!.put('watchlist', updated);
    await this.db!.put('pending_sync', {
      id: `sync-${Date.now()}`,
      operation: 'update',
      data: updated,
      timestamp: Date.now(),
    });

    this.channel?.postMessage({ type: 'update', data: updated });
    this.triggerSync();

    return updated;
  }

  async remove(id: string): Promise<void> {
    if (!this.db) await this.init();

    const existing = await this.db!.get('watchlist', id);
    if (!existing) return;

    const deleted: WatchlistItem = {
      ...existing,
      is_deleted: true,
      vector_clock: this.incrementVectorClock(existing.vector_clock),
      sync_version: existing.sync_version + 1,
      updated_at: new Date().toISOString(),
    };

    await this.db!.put('watchlist', deleted);
    await this.db!.put('pending_sync', {
      id: `sync-${Date.now()}`,
      operation: 'delete',
      data: deleted,
      timestamp: Date.now(),
    });

    this.channel?.postMessage({ type: 'update', data: deleted });
    this.triggerSync();
  }

  async getAll(): Promise<WatchlistItem[]> {
    if (!this.db) await this.init();
    const items = await this.db!.getAll('watchlist');
    return items.filter((item) => !item.is_deleted);
  }

  async getByMovie(movieId: string): Promise<WatchlistItem | undefined> {
    if (!this.db) await this.init();
    const items = await this.db!.getAllFromIndex('watchlist', 'by-movie', movieId);
    return items.find((item) => !item.is_deleted);
  }

  private async triggerSync() {
    if (this.syncInProgress || typeof window === 'undefined') return;
    if (!navigator.onLine) {
      window.addEventListener('online', () => this.triggerSync(), { once: true });
      return;
    }

    this.syncInProgress = true;

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_WATCHLIST',
        });
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  async syncWithServer(serverItems: WatchlistItem[]): Promise<void> {
    if (!this.db) await this.init();

    const localItems = await this.db!.getAll('watchlist');
    const conflicts: WatchlistItem[] = [];

    for (const serverItem of serverItems) {
      const localItem = localItems.find((item) => item.id === serverItem.id);

      if (!localItem) {
        await this.db!.put('watchlist', serverItem);
        continue;
      }

      const comparison = this.compareVectorClocks(
        localItem.vector_clock,
        serverItem.vector_clock
      );

      if (comparison === 'before') {
        await this.db!.put('watchlist', serverItem);
      } else if (comparison === 'concurrent') {
        const merged: WatchlistItem = {
          ...serverItem,
          ...localItem,
          vector_clock: this.mergeVectorClocks(
            localItem.vector_clock,
            serverItem.vector_clock
          ),
          updated_at:
            new Date(localItem.updated_at) > new Date(serverItem.updated_at)
              ? localItem.updated_at
              : serverItem.updated_at,
        };

        await this.db!.put('watchlist', merged);
        conflicts.push(merged);
      }
    }

    const pendingKeys = await this.db!.getAllKeys('pending_sync');
    for (const key of pendingKeys) {
      await this.db!.delete('pending_sync', key);
    }

    if (conflicts.length > 0) {
      this.channel?.postMessage({ type: 'conflicts', data: conflicts });
    }
  }
}

export const watchlistStore = new WatchlistStore();
