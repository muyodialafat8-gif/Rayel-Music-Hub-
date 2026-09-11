import { useState, useEffect, useCallback } from 'react';
import { Song } from '../types';
import { INITIAL_SONGS } from '../data/initialSongs';
import { preloadAllStoredCovers, deleteStoredCover } from '../utils/imageStorage';

const STORAGE_KEY = 'rayel_music_hub_songs_v1';
const SYNC_EVENT_NAME = 'rayel_song_catalogue_updated';

function normalizeSongRecords(list: unknown): Song[] {
  if (!Array.isArray(list) || list.length === 0) {
    return INITIAL_SONGS;
  }
  return list.map((item) => ({
    id: item.id || item.songId,
    songId: item.songId,
    title: item.title || 'Untitled',
    coverUrl: item.coverUrl || item.coverImage || '',
    coverImage: item.coverImage || item.coverUrl || '',
    genre: item.genre || 'Afrobeat',
    mood: item.mood || 'Romantic',
    language: item.language || 'English',
    description: item.description || '',
    price: item.price || 'UGX 150,000',
    status: item.status === 'Sold' ? 'Sold' : 'Available',
    featured: Boolean(item.featured),
    createdAt: item.createdAt || new Date().toISOString().split('T')[0],
    updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
  }));
}

export function useSongCatalogue() {
  const [songs, setSongs] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeSongRecords(parsed);
        }
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_SONGS;
  });

  // Preload IndexedDB artworks on startup
  useEffect(() => {
    preloadAllStoredCovers();
  }, []);

  // Save changes & broadcast to other tabs/listeners
  const persistAndBroadcast = useCallback((newSongs: Song[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSongs));
      window.dispatchEvent(new Event(SYNC_EVENT_NAME));
    } catch (err) {
      console.warn('Storage write failed:', err);
    }
  }, []);

  // Real-time listener for cross-tab and cross-component updates
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setSongs(normalizeSongRecords(parsed));
          }
        }
      } catch (err) {
        console.warn('Sync read failed:', err);
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener(SYNC_EVENT_NAME, handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener(SYNC_EVENT_NAME, handleSync);
    };
  }, []);

  // Whenever internal state updates, persist to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
    } catch {
      // quota or private mode fallback
    }
  }, [songs]);

  const addSong = (newSong: Omit<Song, 'createdAt' | 'id'> & { id?: string }) => {
    const now = new Date().toISOString();
    const cover = newSong.coverUrl || newSong.coverImage || '';
    const songWithDate: Song = {
      ...newSong,
      id: newSong.id || newSong.songId,
      songId: newSong.songId,
      coverUrl: cover,
      coverImage: cover,
      createdAt: now.split('T')[0],
      updatedAt: now,
    };
    setSongs((prev) => {
      const updated = [songWithDate, ...prev];
      persistAndBroadcast(updated);
      return updated;
    });
  };

  const updateSong = (updatedSong: Song) => {
    const cover = updatedSong.coverUrl || updatedSong.coverImage || '';
    const refreshed: Song = {
      ...updatedSong,
      id: updatedSong.id || updatedSong.songId,
      songId: updatedSong.songId,
      coverUrl: cover,
      coverImage: cover,
      updatedAt: new Date().toISOString(),
    };
    setSongs((prev) => {
      const updated = prev.map((song) => (song.songId === refreshed.songId ? refreshed : song));
      persistAndBroadcast(updated);
      return updated;
    });
  };

  const deleteSong = (songId: string) => {
    setSongs((prev) => {
      const toDelete = prev.find((s) => s.songId === songId);
      if (toDelete && toDelete.coverUrl) {
        deleteStoredCover(toDelete.coverUrl);
      }
      const updated = prev.filter((song) => song.songId !== songId);
      persistAndBroadcast(updated);
      return updated;
    });
  };

  const markSold = (songId: string) => {
    setSongs((prev) => {
      const updated = prev.map((song) =>
        song.songId === songId
          ? { ...song, status: 'Sold' as const, updatedAt: new Date().toISOString() }
          : song
      );
      persistAndBroadcast(updated);
      return updated;
    });
  };

  const markAvailable = (songId: string) => {
    setSongs((prev) => {
      const updated = prev.map((song) =>
        song.songId === songId
          ? { ...song, status: 'Available' as const, updatedAt: new Date().toISOString() }
          : song
      );
      persistAndBroadcast(updated);
      return updated;
    });
  };

  const featureSong = (songId: string) => {
    setSongs((prev) => {
      const updated = prev.map((song) =>
        song.songId === songId
          ? { ...song, featured: true, updatedAt: new Date().toISOString() }
          : song
      );
      persistAndBroadcast(updated);
      return updated;
    });
  };

  const unfeatureSong = (songId: string) => {
    setSongs((prev) => {
      const updated = prev.map((song) =>
        song.songId === songId
          ? { ...song, featured: false, updatedAt: new Date().toISOString() }
          : song
      );
      persistAndBroadcast(updated);
      return updated;
    });
  };

  const toggleStatus = (songId: string) => {
    setSongs((prev) => {
      const updated = prev.map((song) => {
        if (song.songId === songId) {
          return {
            ...song,
            status: song.status === 'Available' ? ('Sold' as const) : ('Available' as const),
            updatedAt: new Date().toISOString(),
          };
        }
        return song;
      });
      persistAndBroadcast(updated);
      return updated;
    });
  };

  const toggleFeatured = (songId: string) => {
    setSongs((prev) => {
      const updated = prev.map((song) => {
        if (song.songId === songId) {
          return {
            ...song,
            featured: !song.featured,
            updatedAt: new Date().toISOString(),
          };
        }
        return song;
      });
      persistAndBroadcast(updated);
      return updated;
    });
  };

  const resetToDefault = () => {
    setSongs(INITIAL_SONGS);
    persistAndBroadcast(INITIAL_SONGS);
  };

  return {
    songs,
    addSong,
    updateSong,
    deleteSong,
    markSold,
    markAvailable,
    featureSong,
    unfeatureSong,
    toggleStatus,
    toggleFeatured,
    resetToDefault,
  };
}
