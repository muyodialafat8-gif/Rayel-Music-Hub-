export type SongStatus = 'Available' | 'Sold';

export interface Song {
  id: string;
  songId: string;
  title: string;
  coverUrl: string;
  coverImage?: string;
  genre: string;
  mood: string;
  language: string;
  description: string;
  price: string;
  status: SongStatus;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PurchaseInquiry {
  artistName: string;
  phone: string;
  email?: string;
  country: string;
  songName: string;
  songId: string;
  genre?: string;
  mood?: string;
  price: string;
  additionalMessage?: string;
}

export interface CustomSongRequest {
  artistName: string;
  whatsappNumber: string;
  genre: string;
  customGenre?: string;
  language: string;
  customLanguage?: string;
  mood: string;
  songTopic: string;
  vocalPreference?: string;
  vocalRange?: string;
  additionalDetails?: string;
}

export type ActiveTab = 'home' | 'songs' | 'featured' | 'custom' | 'about' | 'contact' | 'admin';
