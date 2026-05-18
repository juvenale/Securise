import type { Progress } from "../types";

export const STORAGE_KEY = "sy701-react-progress-v1";
const DB_NAME = "sy701-progress-db";
const DB_VERSION = 1;
const STORE_NAME = "progress";
const RECORD_KEY = "current";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readIndexedProgress(): Promise<Progress | null> {
  if (!("indexedDB" in window)) return null;
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(RECORD_KEY);
    request.onsuccess = () => resolve((request.result as Progress | undefined) || null);
    request.onerror = () => reject(request.error);
  });
}

export async function writeIndexedProgress(progress: Progress): Promise<void> {
  if (!("indexedDB" in window)) return;
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(progress, RECORD_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function hydrateLocalStorageFromIndexedDb(): Promise<void> {
  try {
    const localProgress = localStorage.getItem(STORAGE_KEY);
    if (localProgress) {
      try {
        await writeIndexedProgress(JSON.parse(localProgress) as Progress);
      } catch {
        // Keep the legacy localStorage value as the source of truth if it cannot be parsed.
      }
      return;
    }

    const progress = await readIndexedProgress();
    if (progress) localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage remains the compatibility fallback.
  }
}

export function installProgressMirror(): void {
  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = (key: string, value: string) => {
    originalSetItem(key, value);
    if (key !== STORAGE_KEY) return;
    try {
      void writeIndexedProgress(JSON.parse(value) as Progress);
    } catch {
      // Ignore malformed values; the legacy localStorage write already happened.
    }
  };
}
