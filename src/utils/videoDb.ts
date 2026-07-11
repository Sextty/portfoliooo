const DB_NAME = "wassim_portfolio_videos";
const STORE_NAME = "videos";

export function initVideoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
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

export async function saveVideo(projectId: string, videoBlob: Blob): Promise<void> {
  const db = await initVideoDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(videoBlob, projectId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getVideo(projectId: string): Promise<Blob | null> {
  const db = await initVideoDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(projectId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteVideo(projectId: string): Promise<void> {
  const db = await initVideoDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(projectId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
