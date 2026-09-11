import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Check,
  Search,
  SlidersHorizontal,
  Star,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Database,
  Layers,
  ShoppingBag,
  Music2,
  Eye,
  EyeOff,
  KeyRound,
  UserCheck,
  Info
} from 'lucide-react';
import { Song, SongStatus } from '../types';
import { authService } from '../utils/authService';
import {
  validateCoverArtwork,
  optimizeAndStoreCover,
  CURATED_COVER_PRESETS,
  getLiveCoverUrl,
  deleteStoredCover
} from '../utils/imageStorage';
import { RAYEL_WHATSAPP_DISPLAY, RAYEL_WHATSAPP_NUMBER } from '../utils/whatsapp';

export interface AdminPortalProps {
  songs: Song[];
  onAddSong: (song: Omit<Song, 'createdAt'>) => void;
  onUpdateSong: (song: Song) => void;
  onDeleteSong: (songId: string) => void;
  onToggleStatus: (songId: string) => void;
  onToggleFeatured: (songId: string) => void;
  onMarkSold?: (songId: string) => void;
  onMarkAvailable?: (songId: string) => void;
  onFeatureSong?: (songId: string) => void;
  onUnfeatureSong?: (songId: string) => void;
  onResetCatalogue?: () => void;
  onClose: () => void;
}

type AdminNavTab = 'dashboard' | 'songs' | 'add_song' | 'settings';

const GENRE_OPTIONS = [
  'Afrobeat',
  'Amapiano',
  'Afro-Soul',
  'Dancehall',
  'Afro-Gospel',
  'Bongo Flava',
  'Afro-Pop',
  'R&B',
  'Gengetone',
  'Hip-Hop',
  'Other'
];

const MOOD_OPTIONS = [
  'Romantic',
  'Party / High Energy',
  'Emotional / Uplifting',
  'Dance / Sensual',
  'Heartfelt / Reflective',
  'Dramatic / Emotional',
  'Chill / Smooth',
  'Inspirational',
  'Other'
];

const LANGUAGE_OPTIONS = [
  'English',
  'Luganda',
  'Swahili',
  'English & Luganda',
  'English & Swahili',
  'Luganda & Swahili',
  'Runyankole',
  'Other'
];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  songs,
  onAddSong,
  onUpdateSong,
  onDeleteSong,
  onToggleStatus,
  onToggleFeatured,
  onMarkSold,
  onMarkAvailable,
  onFeatureSong,
  onUnfeatureSong,
  onResetCatalogue,
  onClose,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return authService.isAuthenticated();
  });
  const [hasConfiguredAdmin, setHasConfiguredAdmin] = useState<boolean>(() => {
    return authService.hasConfiguredAdmin();
  });
  const [authMode, setAuthMode] = useState<'login' | 'setup'>(() => {
    return authService.hasConfiguredAdmin() ? 'login' : 'setup';
  });

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // First-time setup form state
  const [setupIdentifier, setSetupIdentifier] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  // Settings: Admin Credential Update State
  const [currentAdminPass, setCurrentAdminPass] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [adminUpdateError, setAdminUpdateError] = useState('');
  const [adminUpdateSuccess, setAdminUpdateSuccess] = useState('');
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  // Active Admin Tab
  const [currentTab, setCurrentTab] = useState<AdminNavTab>('dashboard');

  // Search & Filters in Songs view
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Available' | 'Sold'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured_only'>('all');

  // Delete Confirmation Modal State
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);

  // Add / Edit Song Form State
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [formSongId, setFormSongId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCoverUrl, setFormCoverUrl] = useState(CURATED_COVER_PRESETS[0].url);
  const [formGenre, setFormGenre] = useState('Afrobeat');
  const [formMood, setFormMood] = useState('Romantic');
  const [formLanguage, setFormLanguage] = useState('English & Luganda');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('UGX 150,000');
  const [formStatus, setFormStatus] = useState<SongStatus>('Available');
  const [formFeatured, setFormFeatured] = useState(false);

  // Cover image upload handling
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [imageWarning, setImageWarning] = useState('');
  const [imageDetails, setImageDetails] = useState<{ width?: number; height?: number; sizeMb?: string } | null>(null);

  // Form feedback
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Reset catalogue confirm
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Statistics calculation
  const totalSongs = songs.length;
  const availableSongs = songs.filter((s) => s.status === 'Available').length;
  const soldSongs = songs.filter((s) => s.status === 'Sold').length;
  const featuredSongs = songs.filter((s) => s.featured).length;

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    try {
      const result = await authService.login(identifier, password);
      if (result.success) {
        setIsAuthenticated(true);
        setPassword('');
        setAuthError('');
      } else {
        setAuthError(result.error || 'Authentication failed.');
      }
    } catch {
      setAuthError('An error occurred during authentication.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle First-Admin Setup
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!setupIdentifier.trim()) {
      setAuthError('Please enter an admin email or username.');
      return;
    }
    if (setupPassword.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }
    if (setupPassword !== setupConfirm) {
      setAuthError('Passwords do not match. Please verify and re-type.');
      return;
    }

    setIsSettingUp(true);
    try {
      const result = await authService.setupFirstAdmin(setupIdentifier, setupPassword);
      if (result.success) {
        setHasConfiguredAdmin(true);
        setIsAuthenticated(true);
        setSetupPassword('');
        setSetupConfirm('');
        setAuthError('');
      } else {
        setAuthError(result.error || 'Failed to initialize administrator account.');
      }
    } catch {
      setAuthError('An error occurred while creating your administrator profile.');
    } finally {
      setIsSettingUp(false);
    }
  };

  // Handle Credentials Update from Settings
  const handleUpdateCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminUpdateError('');
    setAdminUpdateSuccess('');

    if (!currentAdminPass) {
      setAdminUpdateError('Please enter your current administrator password to confirm.');
      return;
    }

    if (!newAdminUsername && !newAdminPass) {
      setAdminUpdateError('Please provide a new username/email or a new password.');
      return;
    }

    if (newAdminPass && newAdminPass.length < 8) {
      setAdminUpdateError('New password must be at least 8 characters long.');
      return;
    }

    setIsUpdatingCreds(true);
    try {
      const res = await authService.updateCredentials(currentAdminPass, newAdminUsername, newAdminPass);
      if (res.success) {
        setAdminUpdateSuccess('Administrator credentials successfully updated!');
        setCurrentAdminPass('');
        setNewAdminUsername('');
        setNewAdminPass('');
      } else {
        setAdminUpdateError(res.error || 'Failed to update credentials.');
      }
    } catch {
      setAdminUpdateError('An unexpected error occurred.');
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentTab('dashboard');
  };

  // Switch to Add Song Tab and pre-fill default values for <1 min addition
  const openAddSongForm = () => {
    setEditingSong(null);
    const nextNum = songs.length + 1;
    const padded = nextNum < 10 ? `00${nextNum}` : nextNum < 100 ? `0${nextNum}` : `${nextNum}`;
    setFormSongId(`RMH-${padded}`);
    setFormTitle('');
    setFormCoverUrl(CURATED_COVER_PRESETS[Math.floor(Math.random() * CURATED_COVER_PRESETS.length)].url);
    setFormGenre('Afrobeat');
    setFormMood('Romantic');
    setFormLanguage('English & Luganda');
    setFormDescription('Original studio-crafted African hit with commercial rights waiver.');
    setFormPrice('UGX 150,000');
    setFormStatus('Available');
    setFormFeatured(false);
    setFormError('');
    setFormSuccess('');
    setImageError('');
    setImageWarning('');
    setImageDetails(null);
    setCurrentTab('add_song');
  };

  // Switch to Edit Song
  const openEditSongForm = (song: Song) => {
    setEditingSong(song);
    setFormSongId(song.songId);
    setFormTitle(song.title);
    setFormCoverUrl(song.coverUrl || song.coverImage || CURATED_COVER_PRESETS[0].url);
    setFormGenre(song.genre);
    setFormMood(song.mood);
    setFormLanguage(song.language);
    setFormDescription(song.description);
    setFormPrice(song.price);
    setFormStatus(song.status);
    setFormFeatured(song.featured);
    setFormError('');
    setFormSuccess('');
    setImageError('');
    setImageWarning('');
    setImageDetails(null);
    setCurrentTab('add_song');
  };

  // Cover image file selection & validation
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');
    setImageWarning('');
    setUploadingImage(true);

    try {
      const validation = await validateCoverArtwork(file);
      if (!validation.valid) {
        setImageError(validation.error || 'Invalid cover artwork.');
        setUploadingImage(false);
        return;
      }

      if (validation.warning) {
        setImageWarning(validation.warning);
      }

      setImageDetails({
        width: validation.width,
        height: validation.height,
        sizeMb: (file.size / (1024 * 1024)).toFixed(2),
      });

      // Optimize and store image in IndexedDB / storage (never as Base64 in database)
      const storedUrl = await optimizeAndStoreCover(file, formSongId || 'song');
      setFormCoverUrl(storedUrl);
    } catch (err) {
      console.error('Image handling failed:', err);
      setImageError('Failed to process and store image file.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Song (Add or Edit)
  const handleSaveSong = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formSongId.trim()) {
      setFormError('Song ID is required (e.g. RMH-009).');
      return;
    }
    if (!formTitle.trim()) {
      setFormError('Song title is required.');
      return;
    }
    if (!formCoverUrl.trim()) {
      setFormError('Cover artwork URL or uploaded file is required.');
      return;
    }
    if (!formPrice.trim()) {
      setFormError('Price in UGX is required.');
      return;
    }

    const priceFormatted = formPrice.trim().toUpperCase().startsWith('UGX')
      ? formPrice.trim()
      : `UGX ${formPrice.trim()}`;

    const cleanCover = formCoverUrl.trim();

    if (editingSong) {
      // Update existing song
      const updated: Song = {
        ...editingSong,
        songId: formSongId.trim().toUpperCase(),
        title: formTitle.trim(),
        coverUrl: cleanCover,
        coverImage: cleanCover,
        genre: formGenre.trim(),
        mood: formMood.trim(),
        language: formLanguage.trim(),
        description: formDescription.trim(),
        price: priceFormatted,
        status: formStatus,
        featured: formFeatured,
        updatedAt: new Date().toISOString(),
      };
      onUpdateSong(updated);
      setFormSuccess(`Song "${updated.title}" successfully updated and live in the public catalogue.`);
    } else {
      // Add new song
      // Check for duplicate ID
      const exists = songs.some(
        (s) => s.songId.toUpperCase() === formSongId.trim().toUpperCase()
      );
      if (exists) {
        setFormError(`Song ID "${formSongId.trim()}" already exists. Please use a unique ID.`);
        return;
      }

      onAddSong({
        songId: formSongId.trim().toUpperCase(),
        title: formTitle.trim(),
        coverUrl: cleanCover,
        coverImage: cleanCover,
        genre: formGenre.trim(),
        mood: formMood.trim(),
        language: formLanguage.trim(),
        description: formDescription.trim(),
        price: priceFormatted,
        status: formStatus,
        featured: formFeatured,
        updatedAt: new Date().toISOString(),
      });
      setFormSuccess(`Song "${formTitle.trim()}" successfully added to catalogue and live on the website!`);
    }

    setTimeout(() => {
      setCurrentTab('songs');
    }, 900);
  };

  // Status and Featured Handlers
  const handleMarkSold = (songId: string) => {
    if (onMarkSold) onMarkSold(songId);
    else onToggleStatus(songId);
  };

  const handleMarkAvailable = (songId: string) => {
    if (onMarkAvailable) onMarkAvailable(songId);
    else onToggleStatus(songId);
  };

  const handleToggleFeaturedSong = (song: Song) => {
    if (song.featured) {
      if (onUnfeatureSong) onUnfeatureSong(song.songId);
      else onToggleFeatured(song.songId);
    } else {
      if (onFeatureSong) onFeatureSong(song.songId);
      else onToggleFeatured(song.songId);
    }
  };

  // Delete Action
  const confirmDeleteSong = () => {
    if (songToDelete) {
      if (songToDelete.coverUrl) {
        deleteStoredCover(songToDelete.coverUrl);
      }
      onDeleteSong(songToDelete.songId);
      setSongToDelete(null);
    }
  };

  // Filtered Songs
  const filteredSongs = songs.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.songId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.genre.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      statusFilter === 'all' || s.status === statusFilter;

    const matchFeatured =
      featuredFilter === 'all' || (featuredFilter === 'featured_only' && s.featured);

    return matchSearch && matchStatus && matchFeatured;
  });

  // =========================================================================
  // VIEW: UNPROTECTED LOGIN & FIRST-ADMIN SETUP SCREEN
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="w-full max-w-md relative z-10">
          {/* Logo & Branding */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-xl shadow-amber-500/20 mb-4">
              {authMode === 'setup' ? (
                <ShieldCheck className="w-7 h-7" />
              ) : (
                <Lock className="w-7 h-7" />
              )}
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">
              {authMode === 'setup' ? 'INITIALIZE RAYEL ADMIN' : 'RAYEL ADMIN'}
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1 font-medium">
              {authMode === 'setup'
                ? 'Create your primary administrator account to manage Rayel Music Hub'
                : 'Rayel Music Hub Catalogue Management'}
            </p>
          </div>

          {/* Authentication Card */}
          <div className="bg-[#0e121a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {authError && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            {authMode === 'setup' ? (
              /* ============================================================= */
              /* FIRST-TIME ADMIN SETUP FORM                                    */
              /* ============================================================= */
              <form onSubmit={handleSetupSubmit} className="space-y-4" noValidate>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1 mb-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>First-Time Setup Process</span>
                  </div>
                  <p className="text-white/70 text-[11px] leading-relaxed">
                    Set up your private administrator email/username and secure password. Credentials will be securely salted and hashed using Web Crypto.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="setup-admin-username"
                    className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                  >
                    Admin Email / Username <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="setup-admin-username"
                    type="text"
                    value={setupIdentifier}
                    onChange={(e) => setSetupIdentifier(e.target.value)}
                    placeholder="e.g. officialjeyro@gmail.com or rayel"
                    autoComplete="username"
                    required
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder:text-white/30 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="setup-admin-password"
                    className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                  >
                    Admin Password <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="setup-admin-password"
                      type={showSetupPassword ? 'text' : 'password'}
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      required
                      className="w-full min-h-[44px] px-4 py-2.5 pr-11 rounded-xl bg-black/50 border border-white/10 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder:text-white/30 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSetupPassword(!showSetupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 rounded-md transition-colors"
                      aria-label={showSetupPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSetupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="setup-admin-confirm"
                    className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                  >
                    Confirm Password <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="setup-admin-confirm"
                    type={showSetupPassword ? 'text' : 'password'}
                    value={setupConfirm}
                    onChange={(e) => setSetupConfirm(e.target.value)}
                    placeholder="Re-enter your admin password"
                    autoComplete="new-password"
                    required
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder:text-white/30 transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="admin-setup-btn"
                    disabled={isSettingUp}
                    className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-display font-black text-sm uppercase tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {isSettingUp ? (
                      <span>CREATING ACCOUNT…</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 fill-black" />
                        <span>CREATE ADMIN ACCOUNT & SIGN IN</span>
                      </>
                    )}
                  </button>
                </div>

                {hasConfiguredAdmin && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError('');
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 cursor-pointer"
                    >
                      Already created your account? Return to Login
                    </button>
                  </div>
                )}
              </form>
            ) : (
              /* ============================================================= */
              /* STANDARD LOGIN FORM                                            */
              /* ============================================================= */
              <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="admin-username"
                    className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                  >
                    Email / Username
                  </label>
                  <input
                    id="admin-username"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your admin email or username"
                    autoComplete="username"
                    required
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder:text-white/30 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your administrator password"
                      autoComplete="current-password"
                      required
                      className="w-full min-h-[44px] px-4 py-2.5 pr-11 rounded-xl bg-black/50 border border-white/10 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder:text-white/30 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 rounded-md transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="admin-login-btn"
                    disabled={isLoggingIn}
                    className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-display font-black text-sm uppercase tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {isLoggingIn ? (
                      <span>AUTHENTICATING…</span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 fill-black" />
                        <span>LOGIN TO RAYEL ADMIN</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('setup');
                      setAuthError('');
                    }}
                    className="text-xs text-white/50 hover:text-amber-400 font-medium transition-colors cursor-pointer"
                  >
                    First time or need to reset administrator credentials?
                  </button>
                </div>
              </form>
            )}

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
              <span>Authorized personnel only</span>
              <button
                type="button"
                id="back-to-public-site-btn"
                onClick={onClose}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Website</span>
              </button>
            </div>
          </div>

          <div className="text-center mt-6 text-[11px] text-white/40">
            Protected by cryptographic salted session validation • Rayel Music Hub
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: AUTHENTICATED ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0c0e15]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            {/* Title & Badge */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black font-display font-black text-sm sm:text-base shrink-0 shadow-md shadow-amber-500/20">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-black text-base sm:text-xl text-white tracking-tight uppercase">
                    RAYEL ADMIN
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    Catalogue Active
                  </span>
                </div>
                <p className="text-[11px] text-white/50 truncate">
                  Songwriting Catalogue & Cover Artwork
                </p>
              </div>
            </div>

            {/* Quick Actions / Logout */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="admin-view-website-btn"
                onClick={onClose}
                className="min-h-[44px] px-3 sm:px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="View Public Catalogue"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">View Public Site</span>
              </button>

              <button
                type="button"
                id="admin-logout-btn"
                onClick={handleLogout}
                className="min-h-[44px] px-3 sm:px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <nav aria-label="Admin Navigation" className="flex overflow-x-auto no-scrollbar gap-1 border-t border-white/5 py-2">
            <button
              type="button"
              id="admin-nav-dashboard"
              onClick={() => setCurrentTab('dashboard')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              id="admin-nav-songs"
              onClick={() => setCurrentTab('songs')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                currentTab === 'songs'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Music2 className="w-4 h-4" />
              <span>Songs ({songs.length})</span>
            </button>

            <button
              type="button"
              id="admin-nav-add-song"
              onClick={openAddSongForm}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                currentTab === 'add_song'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Song</span>
            </button>

            <button
              type="button"
              id="admin-nav-settings"
              onClick={() => setCurrentTab('settings')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                currentTab === 'settings'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* =================================================================== */}
        {/* TAB 1: DASHBOARD */}
        {/* =================================================================== */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Greeting & Quick Action Banner */}
            <div className="p-5 sm:p-8 rounded-3xl bg-gradient-to-r from-[#121622] via-[#0e121a] to-[#0a0c12] border border-amber-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  Showroom Overview
                </span>
                <h2 className="font-display font-black text-xl sm:text-2xl text-white uppercase mt-1">
                  RAYEL MUSIC HUB CATALOGUE
                </h2>
                <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-xl">
                  Manage original songs, update pricing, toggle availability, and assign high-resolution cover artwork.
                </p>
              </div>
              <button
                type="button"
                id="dash-quick-add-song-btn"
                onClick={openAddSongForm}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Song</span>
              </button>
            </div>

            {/* Simple Statistics Grid (4 Cards requested) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {/* Card 1: Total Songs */}
              <div className="p-5 rounded-2xl bg-[#0e121a] border border-white/10 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Total Songs
                  </span>
                  <Music2 className="w-4 h-4 text-white/40" />
                </div>
                <div className="font-display font-black text-2xl sm:text-3xl text-white">
                  {totalSongs}
                </div>
                <div className="text-[11px] text-white/40 mt-1">In showroom catalogue</div>
              </div>

              {/* Card 2: Available Songs */}
              <div className="p-5 rounded-2xl bg-[#0e121a] border border-emerald-500/20 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Available Songs
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-display font-black text-2xl sm:text-3xl text-emerald-400">
                  {availableSongs}
                </div>
                <div className="text-[11px] text-white/40 mt-1">Ready for artist acquisition</div>
              </div>

              {/* Card 3: Sold Songs */}
              <div className="p-5 rounded-2xl bg-[#0e121a] border border-red-500/20 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                    Sold Songs
                  </span>
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>
                <div className="font-display font-black text-2xl sm:text-3xl text-red-400">
                  {soldSongs}
                </div>
                <div className="text-[11px] text-white/40 mt-1">Acquired exclusively</div>
              </div>

              {/* Card 4: Featured Songs */}
              <div className="p-5 rounded-2xl bg-[#0e121a] border border-amber-500/20 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Featured Songs
                  </span>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                <div className="font-display font-black text-2xl sm:text-3xl text-amber-400">
                  {featuredSongs}
                </div>
                <div className="text-[11px] text-white/40 mt-1">Spotlight section highlights</div>
              </div>
            </div>

            {/* Quick Actions & Recent Songs Snapshot */}
            <div className="rounded-3xl bg-[#0e121a] border border-white/10 p-5 sm:p-7">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display font-black text-base sm:text-lg text-white uppercase">
                    Recent Songs in Catalogue
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Quickly check or edit latest showroom titles
                  </p>
                </div>
                <button
                  type="button"
                  id="view-all-songs-dash-btn"
                  onClick={() => setCurrentTab('songs')}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All ({songs.length})</span>
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {songs.slice(0, 6).map((song) => (
                  <div
                    key={song.songId}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 hover:border-white/15 transition-colors"
                  >
                    <img
                      src={song.coverUrl || song.coverImage}
                      alt={`${song.title} song cover`}
                      className="w-12 h-12 rounded-xl object-cover bg-black shrink-0 aspect-square"
                      width={48}
                      height={48}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-amber-400">
                          {song.songId}
                        </span>
                        {song.featured && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <div className="font-bold text-xs text-white truncate">{song.title}</div>
                      <div className="text-[11px] text-white/40 truncate">
                        {song.genre} • {song.price}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openEditSongForm(song)}
                      className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Edit song"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: SONGS PAGE (List / Table with Search & Filters) */}
        {/* =================================================================== */}
        {currentTab === 'songs' && (
          <div className="space-y-5">
            {/* Header & Controls Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0e121a] border border-white/10 p-4 sm:p-5 rounded-2xl">
              {/* Search by Title / ID */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="admin-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, Song ID (e.g. RMH-001), or genre…"
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 focus:border-amber-400 focus:outline-none text-xs sm:text-sm text-white placeholder:text-white/30"
                />
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  id="admin-filter-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">All Statuses ({songs.length})</option>
                  <option value="Available">Available Only ({availableSongs})</option>
                  <option value="Sold">Sold Only ({soldSongs})</option>
                </select>

                <select
                  id="admin-filter-featured"
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value as any)}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">All Showcase</option>
                  <option value="featured_only">Featured Only ({featuredSongs})</option>
                </select>

                <button
                  type="button"
                  id="admin-add-song-header-btn"
                  onClick={openAddSongForm}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-display font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Song</span>
                </button>
              </div>
            </div>

            {/* Song Count & Active Filters Summary */}
            <div className="flex items-center justify-between text-xs text-white/50 px-1">
              <span>
                Showing <strong className="text-white">{filteredSongs.length}</strong> of {songs.length} songs
              </span>
              {(searchQuery || statusFilter !== 'all' || featuredFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setFeaturedFilter('all');
                  }}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Mobile View: Compact Cards (320px - 767px) */}
            <div className="md:hidden space-y-3">
              {filteredSongs.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#0e121a] border border-white/10 text-white/50 text-xs">
                  No songs match your search or filter criteria.
                </div>
              ) : (
                filteredSongs.map((song) => (
                  <div
                    key={song.songId}
                    className="p-4 rounded-2xl bg-[#0e121a] border border-white/10 shadow-md space-y-3"
                  >
                    {/* Top Row: Thumbnail + Info */}
                    <div className="flex items-start gap-3">
                      <img
                        src={getLiveCoverUrl(song.coverUrl || song.coverImage)}
                        alt={`${song.title} song cover`}
                        className="w-16 h-16 rounded-xl object-cover bg-black shrink-0 border border-white/10 aspect-square"
                        width={64}
                        height={64}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-xs font-bold text-amber-400">
                            {song.songId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              song.status === 'Available'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {song.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white truncate mt-0.5">
                          {song.title}
                        </h4>
                        <div className="text-xs text-white/60 truncate mt-0.5">
                          {song.genre} • {song.mood}
                        </div>
                        <div className="font-mono font-bold text-xs text-amber-400 mt-1">
                          {song.price}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Row on Mobile */}
                    <div className="pt-2 border-t border-white/5 grid grid-cols-4 gap-1.5">
                      {/* Edit */}
                      <button
                        type="button"
                        id={`mobile-edit-${song.songId}`}
                        onClick={() => openEditSongForm(song)}
                        className="min-h-[44px] py-2 px-1 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Edit Song"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Edit</span>
                      </button>

                      {/* Toggle Status (Mark Sold / Mark Available) */}
                      {song.status === 'Available' ? (
                        <button
                          type="button"
                          id={`mobile-mark-sold-${song.songId}`}
                          onClick={() => handleMarkSold(song.songId)}
                          className="min-h-[44px] py-2 px-1 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 font-bold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="Mark Sold"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                          <span>Mark Sold</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          id={`mobile-mark-avail-${song.songId}`}
                          onClick={() => handleMarkAvailable(song.songId)}
                          className="min-h-[44px] py-2 px-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="Mark Available"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Make Avail</span>
                        </button>
                      )}

                      {/* Feature / Unfeature */}
                      <button
                        type="button"
                        id={`mobile-feature-${song.songId}`}
                        onClick={() => handleToggleFeaturedSong(song)}
                        className={`min-h-[44px] py-2 px-1 rounded-xl font-bold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                          song.featured
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/5 hover:bg-white/10 text-white/60'
                        }`}
                        title={song.featured ? 'Unfeature Song' : 'Feature Song'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            song.featured ? 'text-amber-400 fill-amber-400' : 'text-white/40'
                          }`}
                        />
                        <span>{song.featured ? 'Featured' : 'Feature'}</span>
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        id={`mobile-delete-${song.songId}`}
                        onClick={() => setSongToDelete(song)}
                        className="min-h-[44px] py-2 px-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Delete Song"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop & Tablet Table View (>=768px) */}
            <div className="hidden md:block overflow-hidden rounded-2xl bg-[#0e121a] border border-white/10 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/50 text-white/50 uppercase tracking-wider font-semibold border-b border-white/10">
                    <tr>
                      <th className="py-3.5 px-4">Cover</th>
                      <th className="py-3.5 px-4">Song ID</th>
                      <th className="py-3.5 px-4">Title</th>
                      <th className="py-3.5 px-4">Genre</th>
                      <th className="py-3.5 px-4">Mood</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Featured</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSongs.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-white/40">
                          No songs found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredSongs.map((song) => (
                        <tr
                          key={song.songId}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          {/* Cover Thumbnail */}
                          <td className="py-3 px-4">
                            <img
                              src={getLiveCoverUrl(song.coverUrl || song.coverImage)}
                              alt={`${song.title} song cover`}
                              className="w-11 h-11 rounded-lg object-cover bg-black border border-white/10 aspect-square"
                              width={44}
                              height={44}
                            />
                          </td>

                          {/* Song ID */}
                          <td className="py-3 px-4 font-mono font-bold text-amber-400">
                            {song.songId}
                          </td>

                          {/* Title */}
                          <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                            {song.title}
                          </td>

                          {/* Genre */}
                          <td className="py-3 px-4 text-white/80">{song.genre}</td>

                          {/* Mood */}
                          <td className="py-3 px-4 text-white/60">{song.mood}</td>

                          {/* Price */}
                          <td className="py-3 px-4 font-mono font-bold text-amber-400">
                            {song.price}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                song.status === 'Available'
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-red-500/15 text-red-300 border border-red-500/30'
                              }`}
                            >
                              {song.status === 'Available' ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <XCircle className="w-3 h-3 text-red-400" />
                              )}
                              <span>{song.status}</span>
                            </span>
                          </td>

                          {/* Featured */}
                          <td className="py-3 px-4">
                            {song.featured ? (
                              <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span>Yes</span>
                              </span>
                            ) : (
                              <span className="text-white/30 text-[11px]">No</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Edit */}
                              <button
                                type="button"
                                id={`table-edit-${song.songId}`}
                                onClick={() => openEditSongForm(song)}
                                className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                                title="Edit Song"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Toggle Status (Mark Sold / Mark Available) */}
                              {song.status === 'Available' ? (
                                <button
                                  type="button"
                                  id={`table-sold-${song.songId}`}
                                  onClick={() => handleMarkSold(song.songId)}
                                  className="min-h-[44px] px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                                  title="Mark as Sold"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                                  <span>Mark Sold</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  id={`table-avail-${song.songId}`}
                                  onClick={() => handleMarkAvailable(song.songId)}
                                  className="min-h-[44px] px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                                  title="Mark as Available"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Mark Available</span>
                                </button>
                              )}

                              {/* Feature / Unfeature Button */}
                              <button
                                type="button"
                                id={`table-feature-${song.songId}`}
                                onClick={() => handleToggleFeaturedSong(song)}
                                className={`min-h-[44px] min-w-[44px] p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                                  song.featured
                                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                    : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                                }`}
                                title={song.featured ? 'Unfeature Song' : 'Feature in Showcase'}
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    song.featured ? 'fill-amber-400' : ''
                                  }`}
                                />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                id={`table-delete-${song.songId}`}
                                onClick={() => setSongToDelete(song)}
                                className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer flex items-center justify-center"
                                title="Delete Song"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: ADD SONG / EDIT SONG (Under 1-minute completion) */}
        {/* =================================================================== */}
        {currentTab === 'add_song' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#0e121a] border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl">
              {/* Form Title & Context */}
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/10">
                <div>
                  <h2 className="font-display font-black text-xl sm:text-2xl text-white uppercase">
                    {editingSong ? `Edit Song: ${editingSong.songId}` : 'Add Song to Catalogue'}
                  </h2>
                  <p className="text-xs text-white/60 mt-0.5">
                    {editingSong
                      ? 'Update details or cover artwork for this title'
                      : 'Add a new original song to the public showroom in under one minute'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentTab('songs')}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Songs</span>
                </button>
              </div>

              {/* Success / Error Feedback */}
              {formError && (
                <div
                  role="alert"
                  className="mb-5 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div
                  role="status"
                  className="mb-5 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveSong} className="space-y-5" noValidate>
                {/* Row 1: Song ID & Song Title */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 1. Song ID */}
                  <div>
                    <label
                      htmlFor="form-song-id"
                      className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                    >
                      Song ID <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="form-song-id"
                      type="text"
                      value={formSongId}
                      onChange={(e) => setFormSongId(e.target.value.toUpperCase())}
                      placeholder="e.g. RMH-009"
                      required
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 font-mono text-sm text-amber-400 font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  {/* 2. Song Title */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="form-song-title"
                      className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                    >
                      Song Title <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="form-song-title"
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. African Queen Vibes"
                      required
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. Cover Artwork (Strict Rules & Validation) */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="block text-xs font-bold text-white uppercase tracking-wider">
                        Cover Artwork <span className="text-amber-400">*</span>
                      </span>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        Allowed: JPG, PNG, WebP • Max: 5MB • Min: 1000×1000 px • Recommended: 2000×2000 px
                      </p>
                    </div>
                  </div>

                  {/* Preview + Upload Trigger */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Thumbnail Preview */}
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-black/80 border border-white/10 shrink-0 aspect-square shadow-md">
                      <img
                        src={getLiveCoverUrl(formCoverUrl)}
                        alt="Artwork Preview"
                        className="w-full h-full object-cover"
                        width={128}
                        height={128}
                      />
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-amber-400 text-xs font-bold">
                          Processing…
                        </div>
                      )}
                    </div>

                    {/* Upload Controls & Presets */}
                    <div className="flex-1 space-y-2.5 w-full">
                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="cover-file-upload-input"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          id="trigger-cover-upload-btn"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>Upload Artwork File</span>
                        </button>
                      </div>

                      {/* Image Validation Feedback */}
                      {imageError && (
                        <p className="text-xs text-red-400 font-medium">{imageError}</p>
                      )}
                      {imageWarning && (
                        <p className="text-xs text-amber-400 font-medium">{imageWarning}</p>
                      )}
                      {imageDetails && (
                        <p className="text-[11px] text-emerald-400 font-medium">
                          Validated: {imageDetails.width}×{imageDetails.height} px ({imageDetails.sizeMb} MB)
                        </p>
                      )}

                      {/* Fast Studio Presets for 1-minute addition */}
                      <div className="pt-2">
                        <span className="text-[11px] text-white/50 block mb-1.5 font-medium">
                          Or pick a high-resolution studio preset:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {CURATED_COVER_PRESETS.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                setFormCoverUrl(preset.url);
                                setImageError('');
                                setImageWarning('');
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                formCoverUrl === preset.url
                                  ? 'bg-amber-500 text-black'
                                  : 'bg-white/5 hover:bg-white/10 text-white/70'
                              }`}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Genre & Mood & Language */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 4. Genre */}
                  <div>
                    <label
                      htmlFor="form-song-genre"
                      className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                    >
                      Genre <span className="text-amber-400">*</span>
                    </label>
                    <select
                      id="form-song-genre"
                      value={formGenre}
                      onChange={(e) => setFormGenre(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      {GENRE_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 5. Mood */}
                  <div>
                    <label
                      htmlFor="form-song-mood"
                      className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                    >
                      Mood <span className="text-amber-400">*</span>
                    </label>
                    <select
                      id="form-song-mood"
                      value={formMood}
                      onChange={(e) => setFormMood(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      {MOOD_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 6. Language */}
                  <div>
                    <label
                      htmlFor="form-song-language"
                      className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                    >
                      Language <span className="text-amber-400">*</span>
                    </label>
                    <select
                      id="form-song-language"
                      value={formLanguage}
                      onChange={(e) => setFormLanguage(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      {LANGUAGE_OPTIONS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 7. Description */}
                <div>
                  <label
                    htmlFor="form-song-description"
                    className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                  >
                    Description <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    id="form-song-description"
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Short commercial description highlighting vocal tone, groove, and song concept…"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none resize-y"
                  />
                </div>

                {/* Row 4: Price & Status & Featured */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 8. Price in UGX */}
                  <div>
                    <label
                      htmlFor="form-song-price"
                      className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                    >
                      Price in UGX <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="form-song-price"
                      type="text"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="e.g. UGX 150,000"
                      required
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 font-mono text-sm text-amber-400 font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  {/* 9. Status (Available / Sold) */}
                  <div>
                    <label
                      htmlFor="form-song-status"
                      className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                    >
                      Status <span className="text-amber-400">*</span>
                    </label>
                    <select
                      id="form-song-status"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as SongStatus)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-sm font-bold text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      <option value="Available">Available</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>

                  {/* 10. Featured (Yes / No) */}
                  <div>
                    <label
                      htmlFor="form-song-featured"
                      className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                    >
                      Featured <span className="text-amber-400">*</span>
                    </label>
                    <select
                      id="form-song-featured"
                      value={formFeatured ? 'yes' : 'no'}
                      onChange={(e) => setFormFeatured(e.target.value === 'yes')}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-sm font-bold text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes (Spotlight / Curated)</option>
                    </select>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    id="save-song-submit-btn"
                    className="min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-display font-black text-xs sm:text-sm uppercase tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex-1 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingSong ? 'UPDATE SONG' : 'SAVE SONG TO CATALOGUE'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentTab('songs')}
                    className="min-h-[48px] px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs sm:text-sm uppercase transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: SETTINGS (Brand, Contact & Future Firebase Config) */}
        {/* =================================================================== */}
        {currentTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Administrator Account & Password Management */}
            <div className="bg-[#0e121a] border border-white/10 rounded-3xl p-5 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-display font-black text-base sm:text-lg text-white uppercase">
                      Admin Account & Security
                    </h3>
                    <p className="text-xs text-white/50">
                      Manage administrator credentials and update password
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-white/40 block">Active Administrator</span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {authService.getCurrentAdmin()?.username || 'Administrator'}
                  </span>
                </div>
              </div>

              {adminUpdateError && (
                <div role="alert" className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{adminUpdateError}</span>
                </div>
              )}

              {adminUpdateSuccess && (
                <div role="alert" className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{adminUpdateSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdateCredentialsSubmit} className="space-y-4 pt-2">
                <div>
                  <label
                    htmlFor="current-admin-password"
                    className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                  >
                    Current Password <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="current-admin-password"
                    type="password"
                    value={currentAdminPass}
                    onChange={(e) => setCurrentAdminPass(e.target.value)}
                    placeholder="Enter current password to authorize changes"
                    required
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-amber-400 focus:outline-none text-sm text-white placeholder:text-white/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="new-admin-username"
                      className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                    >
                      New Email / Username (Optional)
                    </label>
                    <input
                      id="new-admin-username"
                      type="text"
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      placeholder="e.g. newemail@rayelmusichub.com"
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-amber-400 focus:outline-none text-sm text-white placeholder:text-white/30"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-admin-password"
                      className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5"
                    >
                      New Password (Optional)
                    </label>
                    <input
                      id="new-admin-password"
                      type="password"
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-amber-400 focus:outline-none text-sm text-white placeholder:text-white/30"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    id="update-credentials-btn"
                    disabled={isUpdatingCreds}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white/10 hover:bg-amber-500 text-white hover:text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isUpdatingCreds ? 'UPDATING…' : 'UPDATE ADMIN CREDENTIALS'}
                  </button>
                </div>
              </form>
            </div>

            {/* Brand & Contact Specifications */}
            <div className="bg-[#0e121a] border border-white/10 rounded-3xl p-5 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-black text-lg sm:text-xl text-white uppercase">
                  RAYEL MUSIC HUB SETTINGS
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-xs text-white/50 block font-medium">Website Brand</span>
                  <strong className="text-base text-white font-bold block mt-1">Rayel Music Hub</strong>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-xs text-white/50 block font-medium">Official Tagline</span>
                  <strong className="text-xs text-amber-400 font-bold block mt-1 tracking-wide uppercase">
                    YOUR STORY. OUR WORDS. YOUR HIT.
                  </strong>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-xs text-white/50 block font-medium">Local WhatsApp</span>
                  <strong className="text-base font-mono text-emerald-400 font-bold block mt-1">
                    {RAYEL_WHATSAPP_DISPLAY}
                  </strong>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-xs text-white/50 block font-medium">International WhatsApp</span>
                  <strong className="text-base font-mono text-emerald-400 font-bold block mt-1">
                    {RAYEL_WHATSAPP_NUMBER}
                  </strong>
                </div>
              </div>
            </div>

            {/* Clearly marked configuration section for future Firebase/storage setup */}
            <div className="bg-[#0e121a] border border-amber-500/20 rounded-3xl p-5 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
                <Database className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-display font-black text-base sm:text-lg text-white uppercase">
                    Cloud Storage & Firebase Configuration
                  </h3>
                  <span className="text-xs text-white/50">
                    Future Infrastructure & Production Sync Guide
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-white/70 leading-relaxed">
                <p>
                  The current catalogue operates on persistent client storage and IndexedDB file storage. The architecture has been structured with clean service layers (`imageStorage.ts` and `authService.ts`) so Firebase can be connected without rebuilding any part of the admin panel.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[11px] text-white/40 uppercase font-bold">Catalogue Database</span>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Local Storage / Ready for Firestore</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[11px] text-white/40 uppercase font-bold">Artwork Storage</span>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>IndexedDB / Ready for Firebase Storage</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Security Protocol</span>
                  </div>
                  <p className="text-white/80">
                    Never expose Firebase private service account keys or secret credentials in client-side code. All environment variables must be declared in `.env.example` and accessed via standard environment methods.
                  </p>
                </div>
              </div>
            </div>

            {/* Catalogue Reset Tool (for testing/demo maintenance) */}
            {onResetCatalogue && (
              <div className="bg-[#0e121a] border border-white/10 rounded-3xl p-5 sm:p-8 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white uppercase">Reset Default Catalogue</h4>
                    <p className="text-xs text-white/50 mt-0.5">
                      Restore original 8 baseline songs if test catalogue needs resetting
                    </p>
                  </div>
                  <button
                    type="button"
                    id="admin-reset-catalogue-btn"
                    onClick={() => setShowResetConfirm(true)}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* =================================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* =================================================================== */}
      <AnimatePresence>
        {songToDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e121a] border border-red-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3
                  id="delete-dialog-title"
                  className="font-display font-black text-xl text-white uppercase tracking-tight"
                >
                  Delete this song permanently?
                </h3>
                <p className="text-xs sm:text-sm text-white/70">
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-amber-400 font-bold">
                    {songToDelete.songId} - {songToDelete.title}
                  </strong>{' '}
                  from the public showroom catalogue?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  id="cancel-delete-song-btn"
                  onClick={() => setSongToDelete(null)}
                  className="min-h-[44px] py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  id="confirm-delete-song-btn"
                  onClick={confirmDeleteSong}
                  className="min-h-[44px] py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display font-black text-xs uppercase tracking-wide transition-all shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  DELETE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: RESET CATALOGUE CONFIRMATION */}
      {/* =================================================================== */}
      <AnimatePresence>
        {showResetConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e121a] border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                  Reset Catalogue to Default?
                </h3>
                <p className="text-xs sm:text-sm text-white/70">
                  This will restore the 8 initial catalogue songs. Any custom songs added will be removed.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="min-h-[44px] py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onResetCatalogue) onResetCatalogue();
                    setShowResetConfirm(false);
                    setCurrentTab('dashboard');
                  }}
                  className="min-h-[44px] py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-display font-black text-xs uppercase tracking-wide transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  RESET NOW
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
