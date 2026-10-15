import type { WeekPlan, AppSyncData, AdminUser, AuthState } from './types';
import { getInitialDefaultWeeks } from './defaultWeeks';

const LOCAL_STORAGE_KEY = 'haftalik_program_backup_cache';
const ADMIN_TOKEN_KEY = 'haftalik_program_admin_token';
const ADMIN_OFFLINE_PWD_KEY = 'haftalik_program_admin_offline_pwd';

// Admin Token Management
export function getStoredAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {
    // Ignored
  }
}

// Local cache
export function getLocalCache(): AppSyncData | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.weeks) && parsed.weeks.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }
  return null;
}

export function saveLocalCache(data: AppSyncData) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

// Safe initial data getter
export function getSafeInitialData(): AppSyncData {
  const cached = getLocalCache();
  if (cached) return cached;

  const defaultData: AppSyncData = {
    lastUpdated: new Date().toISOString(),
    weeks: getInitialDefaultWeeks(),
  };
  saveLocalCache(defaultData);
  return defaultData;
}

// Admin API calls with fallback
export async function loginAdminApi(username: string, password: string): Promise<{ user: AdminUser; token: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setStoredAdminToken(data.token);
      return { user: data.user, token: data.token };
    } else {
      const data = await res.json().catch(() => ({}));
      // If server explicitly denied credentials
      if (res.status === 401 || res.status === 400) {
        throw new Error(data.error || 'Kullanıcı adı veya şifre hatalı.');
      }
    }
  } catch (err: any) {
    // If it's a credentials error thrown above, re-throw it
    if (err.message && (err.message.includes('hatalı') || err.message.includes('zorunludur'))) {
      throw err;
    }
    console.warn('Sunucuya ulaşılamadı, yerel doğrulama deneniyor:', err);
  }

  // Offline / Static fallback validation
  const cleanUser = username.trim().toLowerCase();
  const savedOfflinePwd = localStorage.getItem(ADMIN_OFFLINE_PWD_KEY) || 'admin123';
  if ((cleanUser === 'admin' || cleanUser === 'mertkirli5331@gmail.com') && password === savedOfflinePwd) {
    const fakeToken = 'offline_adm_' + Date.now();
    setStoredAdminToken(fakeToken);
    return {
      user: { username: 'admin', email: 'mertkirli5331@gmail.com' },
      token: fakeToken,
    };
  }

  throw new Error('Kullanıcı adı veya şifre hatalı.');
}

export async function verifyAdminSessionApi(): Promise<AuthState> {
  const token = getStoredAdminToken();
  if (!token) {
    return { isAdmin: false, user: null, token: null };
  }

  if (token.startsWith('offline_adm_')) {
    return {
      isAdmin: true,
      user: { username: 'admin', email: 'mertkirli5331@gmail.com' },
      token,
    };
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.isAdmin) {
        return { isAdmin: true, user: data.user, token };
      }
    }
  } catch {
    // If server is unreachable but we have an active token, allow offline admin
    return {
      isAdmin: true,
      user: { username: 'admin', email: 'mertkirli5331@gmail.com' },
      token,
    };
  }

  setStoredAdminToken(null);
  return { isAdmin: false, user: null, token: null };
}

export async function logoutAdminApi(): Promise<void> {
  const token = getStoredAdminToken();
  if (token && !token.startsWith('offline_adm_')) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignored
    }
  }
  setStoredAdminToken(null);
}

export async function changeAdminPasswordApi(currentPassword: string, newPassword: string): Promise<string> {
  const token = getStoredAdminToken();
  if (!token) {
    throw new Error('Yönetici girişi bulunamadı.');
  }

  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(ADMIN_OFFLINE_PWD_KEY, newPassword);
      return data.message || 'Şifre başarıyla güncellendi.';
    }
  } catch (err) {
    console.warn('Sunucuya erişilemedi, çevrimdışı şifre güncelleniyor:', err);
  }

  // Offline fallback password update
  const savedOfflinePwd = localStorage.getItem(ADMIN_OFFLINE_PWD_KEY) || 'admin123';
  if (currentPassword !== savedOfflinePwd) {
    throw new Error('Mevcut şifreniz hatalı.');
  }
  localStorage.setItem(ADMIN_OFFLINE_PWD_KEY, newPassword);
  return 'Yönetici şifresi başarıyla güncellendi.';
}

// Fetch all weeks (NEVER throws fatal errors; always returns valid 38-week data)
export async function fetchAllWeeks(): Promise<AppSyncData> {
  // First, get whatever is cached or default
  const fallbackData = getSafeInitialData();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('/api/weeks', {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const serverData = await res.json();
      if (serverData && Array.isArray(serverData.weeks) && serverData.weeks.length > 0) {
        saveLocalCache(serverData);
        return serverData;
      }
    }
  } catch (err) {
    console.warn('Sunucu /api/weeks yanıt vermedi, yerel veriler kullanılıyor:', err);
  }

  // Gracefully return fallbackData
  return fallbackData;
}

// Update a week on the server (Always saves locally first, then attempts server sync)
export async function updateWeekOnServer(weekNumber: number, weekData: Partial<WeekPlan>): Promise<WeekPlan> {
  // Update local cache immediately
  const current = getSafeInitialData();
  const idx = current.weeks.findIndex((w) => w.weekNumber === weekNumber);
  let updatedWeek: WeekPlan;

  if (idx !== -1) {
    updatedWeek = {
      ...current.weeks[idx],
      ...weekData,
      weekNumber,
      updatedAt: new Date().toISOString(),
    };
    current.weeks[idx] = updatedWeek;
  } else {
    updatedWeek = weekData as WeekPlan;
    current.weeks.push(updatedWeek);
  }
  current.lastUpdated = new Date().toISOString();
  saveLocalCache(current);

  // Attempt server sync
  const token = getStoredAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`/api/weeks/${weekNumber}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(weekData),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.week) {
        return data.week;
      }
    }
  } catch (err) {
    console.warn('Sunucuya kaydedilemedi, yerel önbellek korundu:', err);
  }

  return updatedWeek;
}

// Reset 38 weeks
export async function resetAllWeeksOnServer(): Promise<AppSyncData> {
  const initial = {
    lastUpdated: new Date().toISOString(),
    weeks: getInitialDefaultWeeks(),
  };
  saveLocalCache(initial);

  const token = getStoredAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    await fetch('/api/reset', {
      method: 'POST',
      headers,
    });
  } catch {
    // Ignored in offline
  }

  return initial;
}

// Import data
export async function importWeeksToServer(weeks: WeekPlan[]): Promise<AppSyncData> {
  const fullData: AppSyncData = {
    lastUpdated: new Date().toISOString(),
    weeks,
  };
  saveLocalCache(fullData);

  const token = getStoredAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    await fetch('/api/import', {
      method: 'POST',
      headers,
      body: JSON.stringify({ weeks }),
    });
  } catch {
    // Ignored in offline
  }

  return fullData;
}

// Determine Google Drive link type from URL
export function detectDriveLinkType(url: string): 'folder' | 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'form' | 'other' {
  if (!url) return 'other';
  const lower = url.toLowerCase();
  
  if (lower.includes('drive.google.com/drive/folders') || lower.includes('/folders/')) {
    return 'folder';
  }
  if (lower.includes('docs.google.com/document') || lower.includes('/document/d/')) {
    return 'document';
  }
  if (lower.includes('docs.google.com/spreadsheets') || lower.includes('/spreadsheets/d/')) {
    return 'spreadsheet';
  }
  if (lower.includes('docs.google.com/presentation') || lower.includes('/presentation/d/')) {
    return 'presentation';
  }
  if (lower.includes('docs.google.com/forms') || lower.includes('/forms/d/')) {
    return 'form';
  }
  if (lower.includes('.pdf') || lower.includes('/file/d/')) {
    return 'pdf';
  }
  if (lower.includes('drive.google.com') || lower.includes('docs.google.com')) {
    return 'folder';
  }
  return 'other';
}
