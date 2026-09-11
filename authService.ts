/**
 * Rayel Music Hub - Admin Authentication Service
 *
 * Implements client-side salted cryptographic authentication via the Web Crypto API.
 * Supports secure first-admin account creation, persistent salted hash storage,
 * and 8-hour session management.
 *
 * Designed to easily transition to Firebase Authentication when cloud services are provisioned.
 *
 * Absolutely NO plaintext passwords or credentials are ever stored in source code.
 */

interface AdminProfile {
  username: string;
  salt: string;
  hash: string;
  createdAt: string;
}

interface AdminSession {
  token: string;
  username: string;
  expiresAt: number;
}

const PROFILE_KEY = 'rmh_admin_profile_v1';
const SESSION_KEY = 'rmh_admin_secure_session_v2';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

async function computeSaltedHash(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password.trim()}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateRandomSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const authService = {
  /**
   * Checks whether an admin profile has already been initialized.
   */
  hasConfiguredAdmin(): boolean {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      if (!stored) return false;
      const profile: AdminProfile = JSON.parse(stored);
      return Boolean(profile && profile.username && profile.hash && profile.salt);
    } catch {
      return false;
    }
  },

  /**
   * Secure first-admin initialization.
   * Creates the primary administrator profile with salted cryptographic hashing.
   */
  async setupFirstAdmin(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || cleanId.length < 3) {
      return { success: false, error: 'Please enter a valid admin username or email (at least 3 characters).' };
    }
    if (!cleanPass || cleanPass.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long for security.' };
    }

    try {
      const salt = generateRandomSalt();
      const hash = await computeSaltedHash(cleanPass, salt);

      const profile: AdminProfile = {
        username: cleanId,
        salt,
        hash,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

      // Automatically create an active session for the newly created administrator
      const session: AdminSession = {
        token: `rmh_sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        username: cleanId,
        expiresAt: Date.now() + SESSION_DURATION_MS,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

      return { success: true };
    } catch (err) {
      console.error('Failed to initialize administrator:', err);
      return { success: false, error: 'Could not initialize admin account. Please try again.' };
    }
  },

  /**
   * Checks if an active, unexpired admin session exists.
   */
  isAuthenticated(): boolean {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) return false;

      const session: AdminSession = JSON.parse(stored);
      if (Date.now() > session.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Retrieves the current authenticated admin details.
   */
  getCurrentAdmin(): { username: string } | null {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      const session: AdminSession = JSON.parse(stored);
      if (Date.now() > session.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return { username: session.username };
    } catch {
      return null;
    }
  },

  /**
   * Authenticates the administrator using salted SHA-256 hash comparison.
   */
  async login(
    identifier: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanId) {
      return { success: false, error: 'Please enter your admin email or username.' };
    }
    if (!cleanPass) {
      return { success: false, error: 'Please enter your admin password.' };
    }

    // Verify if an admin profile exists
    let profile: AdminProfile | null = null;
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      if (stored) {
        profile = JSON.parse(stored);
      }
    } catch {
      profile = null;
    }

    if (!profile) {
      return {
        success: false,
        error: 'No administrator account has been created yet. Please initialize your admin account.',
      };
    }

    // Artificial delay to prevent brute-force timing attacks
    await new Promise((r) => setTimeout(r, 400));

    // Verify identifier (case-insensitive)
    if (cleanId !== profile.username.toLowerCase()) {
      return {
        success: false,
        error: 'Invalid administrator credentials. Access restricted to Rayel Music Hub management.',
      };
    }

    // Verify password hash
    const enteredHash = await computeSaltedHash(cleanPass, profile.salt);
    if (enteredHash !== profile.hash) {
      return {
        success: false,
        error: 'Incorrect administrator password. Access denied.',
      };
    }

    // Generate authenticated session token
    const session: AdminSession = {
      token: `rmh_sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      username: profile.username,
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };

    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (err) {
      console.warn('Unable to persist session storage:', err);
    }

    return { success: true };
  },

  /**
   * Updates admin credentials (e.g. changing password or email from the settings panel).
   */
  async updateCredentials(
    currentPass: string,
    newUsername?: string,
    newPass?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      if (!stored) {
        return { success: false, error: 'No administrator profile found.' };
      }
      const profile: AdminProfile = JSON.parse(stored);

      const checkHash = await computeSaltedHash(currentPass, profile.salt);
      if (checkHash !== profile.hash) {
        return { success: false, error: 'Current password verification failed.' };
      }

      if (newUsername && newUsername.trim().length >= 3) {
        profile.username = newUsername.trim().toLowerCase();
      }

      if (newPass && newPass.trim().length >= 8) {
        const newSalt = generateRandomSalt();
        profile.salt = newSalt;
        profile.hash = await computeSaltedHash(newPass.trim(), newSalt);
      }

      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

      // Refresh current session username if changed
      const sessionStored = sessionStorage.getItem(SESSION_KEY);
      if (sessionStored) {
        const sess: AdminSession = JSON.parse(sessionStored);
        sess.username = profile.username;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sess));
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update credentials.' };
    }
  },

  /**
   * Destroys the admin session and logs out.
   */
  logout(): void {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignored
    }
  },
};

