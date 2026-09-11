import React, { useState, useEffect } from 'react';

/**
 * Image storage & optimization service for Rayel Music Hub
 * Stores actual image files in IndexedDB / File storage (never as Base64 in the song database).
 * Fully compatible with future Firebase Storage integration.
 */

const DB_NAME = 'RayelMusicHub_Storage';
const STORE_NAME = 'cover_artwork';
const DB_VERSION = 1;

// Curated high-resolution royalty-free cover presets (ready for fast 1-minute song additions)
export const CURATED_COVER_PRESETS = [
  {
    name: 'Afrobeat Sunset Vibes',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Kampala Night Studio',
    url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Soulful Golden Stage',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Electric Dancehall Neon',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Acoustic Sunrise Warmth',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Bongo Flava Live Rhythms',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Afropop Summer Groove',
    url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Amapiano Log-Drum Pulse',
    url: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?auto=format&fit=crop&w=1200&q=85',
  },
];

// Open IndexedDB database
function openStorageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Memory cache for active Blob URLs to avoid redundant recreation
const blobUrlCache = new Map<string, string>();

/**
 * Validate cover artwork file against strict Rayel Hub standards
 * Allowed: JPG, JPEG, PNG, WebP
 * Max: 5MB
 * Minimum: 1000 × 1000 px
 * Recommended: 2000 × 2000 px
 */
export async function validateCoverArtwork(file: File): Promise<{
  valid: boolean;
  error?: string;
  warning?: string;
  width: number;
  height: number;
}> {
  // 1. File size check (Max 5 MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum limit of 5 MB.`,
      width: 0,
      height: 0,
    };
  }

  // 2. Format validation (JPG, JPEG, PNG, WebP)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ext = file.name.split('.').pop()?.toLowerCase();
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];

  if (!allowedTypes.includes(file.type) && (!ext || !allowedExts.includes(ext))) {
    return {
      valid: false,
      error: 'Invalid file format. Only JPG, JPEG, PNG, and WebP cover artworks are allowed.',
      width: 0,
      height: 0,
    };
  }

  // 3. Dimension validation (Minimum 1000 x 1000 px)
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (width < 1000 || height < 1000) {
        resolve({
          valid: false,
          error: `Image dimensions (${width} × ${height} px) are smaller than the minimum requirement of 1000 × 1000 px.`,
          width,
          height,
        });
        return;
      }

      let warning: string | undefined;
      if (width < 2000 || height < 2000) {
        warning = `Image is ${width} × ${height} px. Recommended dimension for ultra-sharp catalogue displays is 2000 × 2000 px.`;
      }

      resolve({
        valid: true,
        warning,
        width,
        height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        valid: false,
        error: 'Unable to process or read this image file. Please provide a valid graphic file.',
        width: 0,
        height: 0,
      });
    };

    img.src = objectUrl;
  });
}

/**
 * Optimizes an image using an HTML5 Canvas and stores the optimized Blob in IndexedDB storage.
 * Returns a stable reference URL (`idb://covers/...`) and registers an active object URL.
 * NEVER stores raw Base64 in the song database.
 */
export async function optimizeAndStoreCover(file: File, songId: string): Promise<string> {
  // Load image into HTML5 Canvas to optimize and bound dimensions
  const imageBitmap = await createImageBitmap(file);
  const maxDimension = 2000;
  let targetWidth = imageBitmap.width;
  let targetHeight = imageBitmap.height;

  // Scale down if exceeds 2000px
  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    if (targetWidth > targetHeight) {
      targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
      targetWidth = maxDimension;
    } else {
      targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
      targetHeight = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context could not be created');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

  // Convert to WebP blob (or fallback to JPEG)
  const optimizedBlob: Blob = await new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // Fallback to JPEG
          canvas.toBlob((jpegBlob) => resolve(jpegBlob || file), 'image/jpeg', 0.88);
        }
      },
      'image/webp',
      0.88
    );
  });

  // Store in IndexedDB
  const storageKey = `cover_${songId.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
  try {
    const db = await openStorageDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        id: storageKey,
        songId,
        blob: optimizedBlob,
        mimeType: optimizedBlob.type,
        size: optimizedBlob.size,
        updatedAt: new Date().toISOString(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB write failed, falling back to in-memory URL:', err);
  }

  // Create and cache active blob URL for immediate presentation
  const blobUrl = URL.createObjectURL(optimizedBlob);
  blobUrlCache.set(storageKey, blobUrl);

  // Return storage key reference that can be resolved anywhere
  return `idb://${storageKey}`;
}

// Event listener system for reactive image resolution
type CoverUrlListener = (targetUrl: string, resolvedUrl: string) => void;
const coverUrlListeners = new Set<CoverUrlListener>();

export function subscribeCoverUrlResolved(listener: CoverUrlListener): () => void {
  coverUrlListeners.add(listener);
  return () => {
    coverUrlListeners.delete(listener);
  };
}

export function notifyCoverUrlResolved(targetUrl: string, resolvedUrl: string) {
  coverUrlListeners.forEach((fn) => fn(targetUrl, resolvedUrl));
}

/**
 * Preloads all stored covers from IndexedDB into active blob URLs on app startup.
 */
export async function preloadAllStoredCovers(): Promise<void> {
  try {
    const db = await openStorageDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => {
      const records: Array<{ id: string; blob: Blob }> = req.result || [];
      records.forEach((record) => {
        if (record.id && record.blob) {
          if (!blobUrlCache.has(record.id)) {
            const blobUrl = URL.createObjectURL(record.blob);
            blobUrlCache.set(record.id, blobUrl);
            blobUrlCache.set(`idb://${record.id}`, blobUrl);
            notifyCoverUrlResolved(`idb://${record.id}`, blobUrl);
          }
        }
      });
    };
  } catch (err) {
    console.warn('Could not preload covers from IndexedDB:', err);
  }
}

/**
 * Synchronous resolver that returns active blob URL if cached, raw URL if http(s), or preset while resolving.
 */
export function getLiveCoverUrl(url?: string): string {
  if (!url) return CURATED_COVER_PRESETS[0].url;

  if (url.startsWith('idb://')) {
    const key = url.replace('idb://', '');
    if (blobUrlCache.has(key)) {
      return blobUrlCache.get(key)!;
    }
    if (blobUrlCache.has(url)) {
      return blobUrlCache.get(url)!;
    }

    // Trigger asynchronous resolution in background
    resolveCoverUrl(url).then((resolved) => {
      notifyCoverUrlResolved(url, resolved);
    });

    return CURATED_COVER_PRESETS[0].url;
  }

  return url;
}

/**
 * React hook to automatically resolve and render cover artwork URLs (supports idb://, https://, blob:).
 */
export function useArtworkUrl(url?: string): string {
  const [currentUrl, setCurrentUrl] = React.useState<string>(() => getLiveCoverUrl(url));

  React.useEffect(() => {
    setCurrentUrl(getLiveCoverUrl(url));
    if (!url || !url.startsWith('idb://')) return;

    return subscribeCoverUrlResolved((targetUrl, resolvedUrl) => {
      const key = url.replace('idb://', '');
      if (targetUrl === url || targetUrl === key || targetUrl === `idb://${key}`) {
        setCurrentUrl(resolvedUrl);
      }
    });
  }, [url]);

  return currentUrl;
}

/**
 * Cleans up cover artwork from IndexedDB and revokes object URL if safe to do so.
 */
export async function deleteStoredCover(url: string): Promise<void> {
  if (!url || !url.startsWith('idb://')) return;
  const key = url.replace('idb://', '');

  // Revoke cached blob URL
  if (blobUrlCache.has(key)) {
    const blobUrl = blobUrlCache.get(key);
    if (blobUrl && blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
    }
    blobUrlCache.delete(key);
    blobUrlCache.delete(`idb://${key}`);
  }

  // Delete record from IndexedDB
  try {
    const db = await openStorageDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(key);
  } catch (err) {
    console.warn(`Could not delete cover artwork ${key} from IndexedDB:`, err);
  }
}

/**
 * Resolves a cover URL string (supports `idb://`, `blob:`, `https://`, `http://`).
 * If it's an `idb://` key, loads the Blob from IndexedDB and returns a live Blob URL.
 */
export async function resolveCoverUrl(url: string): Promise<string> {
  if (!url) return CURATED_COVER_PRESETS[0].url;

  if (url.startsWith('idb://')) {
    const key = url.replace('idb://', '');
    if (blobUrlCache.has(key)) {
      return blobUrlCache.get(key)!;
    }

    try {
      const db = await openStorageDb();
      const record: { blob: Blob } | undefined = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (record && record.blob) {
        const blobUrl = URL.createObjectURL(record.blob);
        blobUrlCache.set(key, blobUrl);
        blobUrlCache.set(`idb://${key}`, blobUrl);
        notifyCoverUrlResolved(`idb://${key}`, blobUrl);
        return blobUrl;
      }
    } catch (err) {
      console.warn(`Could not resolve IndexedDB image for ${key}:`, err);
    }
    // Fallback to preset if not found
    return CURATED_COVER_PRESETS[0].url;
  }

  return url;
}
