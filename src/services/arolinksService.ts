/**
 * GyanSarthi - Arolinks 24-Hour Access Verification Service
 * Handles device unlock, countdown timer, API token shortlink generation,
 * and 24-hour expiration management.
 */

export const AROLINKS_API_TOKEN = 'a7616376b1ef8920d0ad9a7f6ffbb0313d8bbce7';
export const PASS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds
export const STORAGE_KEY = 'gyansarthi_arolinks_pass_v2';
export const PENDING_TOKEN_KEY = 'gyansarthi_pending_token_v2';

export interface VerificationPass {
  isVerified: boolean;
  verifiedAt: number;       // Unix timestamp in ms
  expiresAt: number;        // Unix timestamp in ms (verifiedAt + 24 Hours)
  token: string;            // Session or verification token
  unlockType: 'arolinks' | 'admin' | 'manual';
  deviceModel?: string;
}

export interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  formatted: string;
  percentageLeft: number; // 0 to 100
  isExpired: boolean;
}

class ArolinksService {
  /**
   * Reads stored pass from localStorage and ensures it has not expired
   */
  public getStoredPass(): VerificationPass | null {
    if (typeof window === 'undefined') return null;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const pass: VerificationPass = JSON.parse(raw);
      if (!pass || !pass.isVerified || !pass.expiresAt) {
        this.clearPass();
        return null;
      }

      // Check if 24 hours have elapsed
      const now = Date.now();
      if (now >= pass.expiresAt) {
        // Expired! Remove pass and require re-verification
        this.clearPass();
        return null;
      }

      return pass;
    } catch (err) {
      console.error('Error reading verification pass:', err);
      return null;
    }
  }

  /**
   * Fast check whether the current phone/browser is unlocked
   */
  public isDeviceVerified(): boolean {
    return this.getStoredPass() !== null;
  }

  /**
   * Calculates remaining time for active pass
   */
  public getRemainingTime(pass?: VerificationPass | null): TimeRemaining {
    const currentPass = pass !== undefined ? pass : this.getStoredPass();

    if (!currentPass || !currentPass.isVerified) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        formatted: '00h 00m',
        percentageLeft: 0,
        isExpired: true,
      };
    }

    const now = Date.now();
    const remainingMs = Math.max(0, currentPass.expiresAt - now);
    const totalSeconds = Math.floor(remainingMs / 1000);

    if (totalSeconds <= 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        formatted: '00h 00m',
        percentageLeft: 0,
        isExpired: true,
      };
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const totalDurationMs = currentPass.expiresAt - currentPass.verifiedAt || PASS_DURATION_MS;
    const percentageLeft = Math.min(100, Math.max(0, (remainingMs / totalDurationMs) * 100));

    const formatted = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;

    return {
      hours,
      minutes,
      seconds,
      totalSeconds,
      formatted,
      percentageLeft,
      isExpired: false,
    };
  }

  /**
   * Creates an Arolinks shortlink that returns to this website upon verification
   */
  public async createVerificationLink(): Promise<{
    shortUrl: string;
    token: string;
    destinationUrl: string;
  }> {
    const token = 'aro_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
    
    // Save pending token so we can also recognize it upon tab return
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(PENDING_TOKEN_KEY, token);
    }

    // Build the destination callback URL pointing back to this website
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gyansarthi.in';
    const destinationUrl = `${origin}/?arolinks_token=${encodeURIComponent(token)}&verified=true`;

    // 1. Try server-side proxy route first (prevents any browser CORS issues)
    try {
      const res = await fetch('/api/arolinks/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationUrl, token }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.shortUrl) {
          return {
            shortUrl: data.shortUrl,
            token,
            destinationUrl,
          };
        }
      }
    } catch (e) {
      console.warn('Server proxy unavailable, falling back to direct Arolinks API call', e);
    }

    // 2. Fallback to direct Arolinks API endpoint
    try {
      const arolinksApiUrl = `https://arolinks.com/api?api=${AROLINKS_API_TOKEN}&url=${encodeURIComponent(destinationUrl)}&format=json`;
      const directRes = await fetch(arolinksApiUrl);
      if (directRes.ok) {
        const directData = await directRes.json();
        if (directData && (directData.status === 'success' || directData.shortenedUrl)) {
          return {
            shortUrl: directData.shortenedUrl,
            token,
            destinationUrl,
          };
        }
      }
    } catch (directErr) {
      console.warn('Direct Arolinks API call failed:', directErr);
    }

    // 3. Fallback: return destination directly with instructions if network completely fails
    return {
      shortUrl: `https://arolinks.com/api?api=${AROLINKS_API_TOKEN}&url=${encodeURIComponent(destinationUrl)}`,
      token,
      destinationUrl,
    };
  }

  /**
   * Activates the 24-hour verification pass on this device
   */
  public unlockDevice(token: string, type: 'arolinks' | 'admin' | 'manual' = 'arolinks'): VerificationPass {
    const now = Date.now();
    const pass: VerificationPass = {
      isVerified: true,
      verifiedAt: now,
      expiresAt: now + PASS_DURATION_MS,
      token,
      unlockType: type,
      deviceModel: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 50) : undefined,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pass));
      sessionStorage.removeItem(PENDING_TOKEN_KEY);

      // Fire a custom event so other components or open tabs know immediately
      window.dispatchEvent(new CustomEvent('gyansarthi_pass_updated', { detail: pass }));
    }

    return pass;
  }

  /**
   * Clears the pass (locks the website)
   */
  public clearPass(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('gyansarthi_pass_updated', { detail: null }));
  }

  /**
   * Checks the URL search query on page load to detect if user returned from Arolinks
   */
  public checkAndHandleUrlVerification(): { isVerifiedNow: boolean; token?: string } {
    if (typeof window === 'undefined') return { isVerifiedNow: false };

    try {
      const params = new URLSearchParams(window.location.search);
      const arolinksToken = params.get('arolinks_token') || params.get('verify_token');
      const verifiedParam = params.get('verified') || params.get('status');

      if (arolinksToken || verifiedParam === 'true' || verifiedParam === 'success') {
        const token = arolinksToken || 'aro_return_' + Date.now();
        this.unlockDevice(token, 'arolinks');

        // Clean query params from the browser address bar without reload
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);

        return { isVerifiedNow: true, token };
      }
    } catch (e) {
      console.error('Error checking verification URL:', e);
    }

    return { isVerifiedNow: false };
  }

  /**
   * Checks if a pending token from session can be verified (e.g. if user completed in another tab)
   */
  public verifyPendingSession(): boolean {
    if (typeof window === 'undefined') return false;
    const pending = sessionStorage.getItem(PENDING_TOKEN_KEY);
    if (pending) {
      this.unlockDevice(pending, 'manual');
      return true;
    }
    return false;
  }

  /**
   * Admin / Owner bypass key verification
   */
  public verifyAdminBypass(code: string): boolean {
    const trimmed = (code || '').trim();
    if (!trimmed) return false;

    // Allowed emergency bypass keys: the Arolinks API token, or admin secret keys
    const validKeys = [
      AROLINKS_API_TOKEN,
      'gyanboss2026',
      'gyansarthi24h',
      'targetboard24',
      'admin2026',
    ];

    if (validKeys.includes(trimmed)) {
      this.unlockDevice('admin_bypass_' + Date.now(), 'admin');
      return true;
    }

    return false;
  }
}

export const arolinksService = new ArolinksService();
