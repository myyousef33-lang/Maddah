const DB_NAME = 'maddah_math_media_db';
const STORE_NAME = 'media_blobs';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const MediaStore = {
  async saveMedia(file: File | Blob, customKey?: string): Promise<string> {
    const key = customKey || `local-media:${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(file, key);
        req.onsuccess = () => resolve(key);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('[MediaStore] IndexedDB save failed:', e);
      return URL.createObjectURL(file);
    }
  },

  async getMediaUrl(mediaKey: string): Promise<string | null> {
    if (!mediaKey) return null;
    if (mediaKey.startsWith('http://') || mediaKey.startsWith('https://') || mediaKey.startsWith('data:') || mediaKey.startsWith('blob:')) {
      return mediaKey;
    }
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(mediaKey);
        req.onsuccess = () => {
          const blob = req.result;
          if (blob && (blob instanceof Blob || blob instanceof File)) {
            resolve(URL.createObjectURL(blob));
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      console.warn('[MediaStore] IndexedDB get failed:', e);
      return null;
    }
  },

  async deleteMedia(mediaKey: string): Promise<void> {
    if (!mediaKey || !mediaKey.startsWith('local-media:')) return;
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(mediaKey);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    } catch (_) {}
  }
};
