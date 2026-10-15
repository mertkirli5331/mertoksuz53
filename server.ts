import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import type { WeekPlan, DriveLink } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'weeks-data.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin-config.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Admin configuration helper
interface AdminConfig {
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  updatedAt: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function getOrInitAdminConfig(): AdminConfig {
  try {
    if (fs.existsSync(ADMIN_FILE)) {
      const raw = fs.readFileSync(ADMIN_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.passwordHash && parsed.salt) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading admin config, re-creating default:', err);
  }

  // Default initial admin
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword('admin123', salt);
  const defaultConfig: AdminConfig = {
    username: 'admin',
    email: 'mertkirli5331@gmail.com',
    passwordHash,
    salt,
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(defaultConfig, null, 2), 'utf-8');
  return defaultConfig;
}

// Active session tokens: token -> { username, email, expiresAt }
const activeAdminTokens = new Map<string, { username: string; email: string; expiresAt: number }>();

function generateToken(username: string, email: string): string {
  const token = 'adm_' + crypto.randomBytes(32).toString('hex');
  // 7 days expiration
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  activeAdminTokens.set(token, { username, email, expiresAt });
  return token;
}

function validateToken(token?: string): { username: string; email: string } | null {
  if (!token) return null;
  const session = activeAdminTokens.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeAdminTokens.delete(token);
    return null;
  }
  return { username: session.username, email: session.email };
}

// Middleware to protect write actions
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Bu işlemi gerçekleştirmek için yönetici girişi yapmanız gerekmektedir.'
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const admin = validateToken(token);
  if (!admin) {
    res.status(401).json({
      error: 'Yönetici oturum süresi doldu veya geçersiz. Lütfen tekrar giriş yapınız.'
    });
    return;
  }

  (req as any).adminUser = admin;
  next();
}

// Generate default 38 weeks
function generateDefaultWeeks(): WeekPlan[] {
  const weeks: WeekPlan[] = [];
  const titles = [
    'Oryantasyon & Temel Bilgilere Giriş',
    'Temel Kavramlar ve Hedef Belirleme',
    'Konu İncelemeleri & Kaynak Taraması',
    '1. Modül: Başlangıç Uygulamaları',
    'Analiz ve Değerlendirme',
    'Problem Çözme Teknikleri',
    '2. Modül: Derinlemesine Çalışma',
    'Pratik & Ara Değerlendirme',
    'Haftalık Tekrar & Quiz / Özet',
    'Proje Planlama & Dokümantasyon',
    'Uygulamalı Çalışma 1',
    'Uygulamalı Çalışma 2',
    'İlk Çeyrek İlerleme Değerlendirmesi',
    'İleri Seviye Konulara Giriş',
    'Vaka Analizi & Örnek Çalışmalar',
    '3. Modül: Uzmanlaşma Adımları',
    'Kritik Beceriler & Metotlar',
    'Grup / Bireysel Çalışma & Notlar',
    'Yarıyıl Kapsamlı Tekrar & Özet',
    'İkinci Dönem Hedefleri & Strateji',
    '4. Modül: Gelişmiş Uygulamalar',
    'Veri & Doküman İncelemesi',
    'Zorlayıcı Konular & Çözümler',
    'Geri Bildirim & İyileştirme',
    '5. Modül: Proje Geliştirme',
    'Entegrasyon & Sistem Tasarımı',
    'Pratik Senaryolar & Simülasyon',
    'Performans & Hız Artırma',
    '6. Modül: Kapsamlı Denemeler',
    'Hata Analizi & Eksik Giderme',
    'Büyük Proje / Tez Hazırlığı',
    'Proje Sunum & Dokümantasyonu',
    'Son Düzlük: Hızlı Hatırlatmalar',
    'Genel Tekrar & Soru Çözümü',
    'Stres Yönetimi & Zaman Planlaması',
    'Son Değerlendirme Denemeleri',
    'Nihai İnceleme & Eksiksiz Kontrol',
    '38. Hafta: Final Tamamlama & Başarı Değerlendirmesi'
  ];

  for (let i = 1; i <= 38; i++) {
    const title = titles[i - 1] || `${i}. Hafta`;
    const defaultLinks: DriveLink[] = [];
    
    // Example link in week 1
    if (i === 1) {
      defaultLinks.push({
        id: 'sample-drive-1',
        title: 'Örnek: Ders & Çalışma Materyalleri Klasörü',
        url: 'https://drive.google.com',
        type: 'folder',
        addedAt: new Date().toISOString(),
        notes: 'Haftalık ders materyalleri ve PDF dökümanları'
      });
    }

    // Link in week 3
    if (i === 3) {
      defaultLinks.push({
        id: 'link-week-3-vercel',
        title: '3. Hafta Çalışma & Uygulama Bağlantısı',
        url: 'https://opjsdfl-kjsdl-kjasdl-kjds-rblc.vercel.app/',
        type: 'other',
        addedAt: new Date().toISOString(),
        notes: 'Haftalık interaktif çalışma ve kaynak platformu'
      });
    }

    weeks.push({
      weekNumber: i,
      title: `${i}. Hafta: ${title}`,
      subtitle: i <= 13 ? '1. Dönem / Temel Aşama' : i <= 26 ? '2. Dönem / Gelişme Aşaması' : '3. Dönem / İleri & Final Aşaması',
      status: i === 1 ? 'in_progress' : 'not_started',
      notes: i === 1 ? 'Hoş geldiniz! Bu alana haftalık çalışma notlarınızı, konuları, özetleri ve yönergeleri yazabilirsiniz. Aşağıdaki Google Drive linkleri bölümünden ilgili klasör ve dosyalarınızı ekleyebilirsiniz. Eklediğiniz her şey sunucuya kaydedilir ve tüm telefon, tablet ve bilgisayarlarınızda anında görünür.' : '',
      driveLinks: defaultLinks,
      tasks: [
        { id: `task-${i}-1`, text: 'Haftalık plan ve hedefleri belirle', completed: i === 1 },
        { id: `task-${i}-2`, text: 'Google Drive kaynaklarını incele', completed: false },
        { id: `task-${i}-3`, text: 'Haftalık çalışma ve ödevleri tamamla', completed: false }
      ],
      colorTag: i <= 13 ? 'blue' : i <= 26 ? 'emerald' : 'purple',
      updatedAt: new Date().toISOString()
    });
  }

  return weeks;
}

// Read database
function readWeeksData(): { lastUpdated: string; weeks: WeekPlan[] } {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.weeks) && data.weeks.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.error('Error reading data file, reinitializing default:', err);
  }

  const initialData = {
    lastUpdated: new Date().toISOString(),
    weeks: generateDefaultWeeks()
  };
  saveWeeksData(initialData);
  return initialData;
}

// Save database
function saveWeeksData(data: { lastUpdated: string; weeks: WeekPlan[] }) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  broadcastUpdate(data);
}

// SSE Clients for instant real-time sync across devices
const sseClients: Response[] = [];

function broadcastUpdate(data: { lastUpdated: string; weeks: WeekPlan[] }) {
  const message = `data: ${JSON.stringify({ type: 'UPDATE', lastUpdated: data.lastUpdated, weeks: data.weeks })}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(message);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Ensure admin config is initialized
  getOrInitAdminConfig();

  // AUTH ENDPOINTS
  // 1. Admin Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Kullanıcı adı/e-posta ve şifre zorunludur.' });
      return;
    }

    const admin = getOrInitAdminConfig();
    const inputClean = username.trim().toLowerCase();
    const matchesUser = inputClean === admin.username.toLowerCase() || inputClean === admin.email.toLowerCase();

    if (!matchesUser) {
      res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
      return;
    }

    const inputHash = hashPassword(password, admin.salt);
    if (inputHash !== admin.passwordHash) {
      res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
      return;
    }

    // Success
    const token = generateToken(admin.username, admin.email);
    res.json({
      success: true,
      token,
      user: {
        username: admin.username,
        email: admin.email
      }
    });
  });

  // 2. Check Auth Status
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.json({ isAdmin: false });
      return;
    }
    const token = authHeader.split(' ')[1];
    const admin = validateToken(token);
    if (!admin) {
      res.json({ isAdmin: false });
      return;
    }
    res.json({
      isAdmin: true,
      user: admin
    });
  });

  // 3. Admin Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      activeAdminTokens.delete(token);
    }
    res.json({ success: true, message: 'Çıkış yapıldı.' });
  });

  // 4. Change Password (requires current login)
  app.post('/api/auth/change-password', requireAdminAuth, (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Mevcut şifre ve yeni şifre zorunludur.' });
      return;
    }
    if (newPassword.length < 5) {
      res.status(400).json({ error: 'Yeni şifre en az 5 karakter olmalıdır.' });
      return;
    }

    const admin = getOrInitAdminConfig();
    const currentHash = hashPassword(currentPassword, admin.salt);
    if (currentHash !== admin.passwordHash) {
      res.status(400).json({ error: 'Mevcut şifreniz hatalı.' });
      return;
    }

    // Update password
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = hashPassword(newPassword, newSalt);
    admin.passwordHash = newHash;
    admin.salt = newSalt;
    admin.updatedAt = new Date().toISOString();

    fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), 'utf-8');
    res.json({ success: true, message: 'Yönetici şifresi başarıyla güncellendi.' });
  });

  // WEEKS API ENDPOINTS (Public Read, Protected Write)
  // 1. Get all weeks (Public)
  app.get('/api/weeks', (_req: Request, res: Response) => {
    const data = readWeeksData();
    res.json(data);
  });

  // 2. Get single week (Public)
  app.get('/api/weeks/:weekNumber', (req: Request, res: Response) => {
    const weekNum = Number(req.params.weekNumber);
    const data = readWeeksData();
    const week = data.weeks.find((w) => w.weekNumber === weekNum);
    if (!week) {
      res.status(404).json({ error: 'Hafta bulunamadı' });
      return;
    }
    res.json(week);
  });

  // 3. Update single week (Protected: Admin Only)
  app.put('/api/weeks/:weekNumber', requireAdminAuth, (req: Request, res: Response) => {
    const weekNum = Number(req.params.weekNumber);
    const updatePayload = req.body;
    const data = readWeeksData();

    const index = data.weeks.findIndex((w) => w.weekNumber === weekNum);
    if (index === -1) {
      res.status(404).json({ error: 'Hafta bulunamadı' });
      return;
    }

    const updatedWeek: WeekPlan = {
      ...data.weeks[index],
      ...updatePayload,
      weekNumber: weekNum,
      updatedAt: new Date().toISOString()
    };

    data.weeks[index] = updatedWeek;
    saveWeeksData(data);
    res.json({ success: true, week: updatedWeek, lastUpdated: data.lastUpdated });
  });

  // 4. Reset to default 38 weeks (Protected: Admin Only)
  app.post('/api/reset', requireAdminAuth, (_req: Request, res: Response) => {
    const initialData = {
      lastUpdated: new Date().toISOString(),
      weeks: generateDefaultWeeks()
    };
    saveWeeksData(initialData);
    res.json({ success: true, message: '38 haftalık program varsayılana sıfırlandı.', data: initialData });
  });

  // 5. Bulk import / restore (Protected: Admin Only)
  app.post('/api/import', requireAdminAuth, (req: Request, res: Response) => {
    const { weeks } = req.body;
    if (!Array.isArray(weeks) || weeks.length === 0) {
      res.status(400).json({ error: 'Geçersiz veri formatı. weeks dizisi gereklidir.' });
      return;
    }
    const data = {
      lastUpdated: new Date().toISOString(),
      weeks
    };
    saveWeeksData(data);
    res.json({ success: true, count: weeks.length, lastUpdated: data.lastUpdated });
  });

  // 6. Real-time Server-Sent Events (SSE) (Public)
  app.get('/api/sync/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.push(res);

    // Initial ping
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) {
        sseClients.splice(idx, 1);
      }
    });
  });

  // Vite middleware in dev or static files in production
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 38 Haftalık Program Sunucusu http://0.0.0.0:${PORT} adresinde hazır!`);
  });
}

startServer().catch((err) => {
  console.error('Sunucu başlatma hatası:', err);
  process.exit(1);
});
