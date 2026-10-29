import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Helper to initialize Gemini client safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Admin Authentication endpoint
app.post('/api/auth/admin-login', (req: Request, res: Response): void => {
  const { username, password } = req.body || {};
  const ADMIN_PASSWORD = '21@prill2005';

  if (!password || password !== ADMIN_PASSWORD) {
    res.status(401).json({
      success: false,
      message: 'Password admin tidak valid! Silakan periksa kembali password.',
    });
    return;
  }

  const cleanUsername = (username && String(username).trim()) || 'admin';

  res.json({
    success: true,
    message: 'Login admin berhasil.',
    user: {
      uid: 'admin_sys_' + Buffer.from(cleanUsername).toString('hex').slice(0, 10),
      username: cleanUsername,
      displayName: `Admin (${cleanUsername})`,
      email: cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@ideaflow.app`,
      role: 'admin',
      isCustomAdmin: true,
      lastLogin: new Date().toISOString(),
    },
    token: `token_admin_${Date.now()}_auth`,
  });
});

// AI Idea Generator
app.post('/api/ai/generate-ideas', async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, category, targetAudience, goals } = req.body || {};
    if (!topic) {
      res.status(400).json({ error: 'Topik atau ide awal harus diisi.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback mock structure if GEMINI_API_KEY is not yet populated
      res.json({
        title: `${topic} - Inovasi Digital`,
        overview: `Platform cerdas yang dirancang untuk ${topic} dengan integrasi alur kerja modern dan analitik cerdas.`,
        category: category || 'Produktivitas & SaaS',
        targetAudience: targetAudience || 'Pengembang, Bisnis, & Tim Kolaboratif',
        keyFeatures: [
          'Dashboard Manajemen Realtime & Visualisasi Proyek',
          'Automasi Analisis Data & Ekstraksi Ide Gemini AI',
          'Kanban Board Kolaboratif dengan Delegasi Tugas',
          'Laporan Perkembangan Otomatis & Notifikasi Cerdas'
        ],
        techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase Firestore', 'Express Backend', 'Google Gemini AI'],
        milestones: [
          { title: 'Riset Pasar & Spesifikasi Kebutuhan', priority: 'high', status: 'done' },
          { title: 'Arsitektur Database & Skema Firestore', priority: 'high', status: 'in_progress' },
          { title: 'Integrasi AI Gemini & Prompt Pipeline', priority: 'medium', status: 'todo' },
          { title: 'Testing Alpha & Deployment Vercel', priority: 'medium', status: 'todo' }
        ],
        potentialChallenges: [
          'Optimalisasi latensi respon AI',
          'Skalabilitas sinkronisasi Firestore realtime',
          'Adopsi antarmuka pengguna yang intuitif'
        ],
        marketValue: 'Tinggi, memiliki diferensiasi kuat berkat integrasi AI dan sinkronisasi realtime.'
      });
      return;
    }

    const prompt = `
Anda adalah seorang konsultan produk dan arsitek sistem terkemuka.
Hasilkan blueprint ide aplikasi yang komprehensif, terstruktur, dan actionable berdasarkan input berikut:
- Topik / Ide Utama: "${topic}"
- Kategori: "${category || 'Teknologi & Produktivitas'}"
- Target Audiens: "${targetAudience || 'Profesional & Bisnis'}"
- Tujuan / Goals: "${goals || 'Meningkatkan efisiensi dan kolaborasi'}"

Format respon WAJIB berupa JSON murni tanpa markdown triple-backtick, dengan struktur:
{
  "title": "Nama proyek yang menarik dan profesional",
  "overview": "Deskripsi singkat dan mendalam (2-3 kalimat)",
  "category": "Kategori spesifik",
  "targetAudience": "Target pengguna yang relevan",
  "keyFeatures": ["Fitur 1", "Fitur 2", "Fitur 3", "Fitur 4", "Fitur 5"],
  "techStack": ["Teknologi 1", "Teknologi 2", "Teknologi 3", "Teknologi 4"],
  "milestones": [
    { "title": "Milestone 1", "priority": "high", "status": "todo" },
    { "title": "Milestone 2", "priority": "medium", "status": "todo" },
    { "title": "Milestone 3", "priority": "high", "status": "todo" },
    { "title": "Milestone 4", "priority": "medium", "status": "todo" }
  ],
  "potentialChallenges": ["Tantangan 1", "Tantangan 2", "Tantangan 3"],
  "marketValue": "Analisis potensi pasar dan nilai jual unik"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Gagal memparsing JSON dari Gemini.');
      }
    }

    res.json(parsedData);
  } catch (error) {
    console.error('Error generating idea:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Gagal menghasilkan ide dengan AI.',
    });
  }
});

// AI Kanban Action Plan Generator
app.post('/api/ai/action-plan', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectTitle, description } = req.body || {};
    if (!projectTitle) {
      res.status(400).json({ error: 'Judul proyek diperlukan.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        tasks: [
          { title: 'Setup Repository & Environment Variables', description: 'Konfigurasi .env dan inisialisasi modul', status: 'done', priority: 'high' },
          { title: 'Desain Antarmuka Utama & Komponen UI', description: 'Implementasi tema Tailwind CSS dan layout responsif', status: 'in_progress', priority: 'high' },
          { title: 'Konfigurasi Firestore Rules & Indexes', description: 'Amankan koleksi dan buat aturan akses ketat', status: 'todo', priority: 'medium' },
          { title: 'Integrasi Otomasi AI dengan Gemini API', description: 'Hubungkan endpoint server-side untuk ideation', status: 'todo', priority: 'high' },
          { title: 'Uji Coba & Deploy ke Vercel', description: 'Pastikan build lolos dan vercel.json rewrite berjalan lancar', status: 'todo', priority: 'medium' }
        ]
      });
      return;
    }

    const prompt = `
Buat daftar 5-7 tugas kanban (action plan) yang konkret untuk proyek berikut:
Judul Proyek: "${projectTitle}"
Deskripsi: "${description || 'Proyek manajemen ide cerdas'}"

Berikan output berupa JSON murni dengan format:
{
  "tasks": [
    {
      "title": "Judul tugas singkat (max 60 karakter)",
      "description": "Langkah detail atau kriteria selesai (1-2 kalimat)",
      "status": "todo" | "in_progress" | "review" | "done",
      "priority": "low" | "medium" | "high"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{"tasks":[]}';
    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (error) {
    console.error('Error action-plan:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Gagal membuat action plan.',
    });
  }
});

// AI Interactive Brainstorming Assistant
app.post('/api/ai/brainstorm', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectTitle, projectDescription, userMessage, history } = req.body || {};
    if (!userMessage) {
      res.status(400).json({ error: 'Pesan pengguna tidak boleh kosong.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        reply: `[Mode Standar / Gemini API Key belum diset] Terkait pertanyaan "${userMessage}": Anda dapat fokus pada penyempurnaan alur kerja pengguna, validasi kebutuhan pasar tercepat (MVP), serta pemanfaatan Firebase Firestore untuk sinkronisasi seketika.`
      });
      return;
    }

    const systemInstruction = `
Anda adalah asisten konsultan strategi produk "IdeaFlow AI".
Anda ramah, solutif, analitis, dan berpengalaman dalam pengembangan perangkat lunak modern.
Konteks Proyek Saat Ini:
- Judul Proyek: ${projectTitle || 'Workspace Kolaborasi'}
- Gambaran: ${projectDescription || 'Aplikasi web interaktif'}
Berikan jawaban yang jelas, bernas, gunakan poin-poin bila membantu, dan selalu sarankan langkah konkret berikutnya.
`;

    const contents = [
      ...(Array.isArray(history) ? history.map((h: { role: string; content: string }) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      })) : []),
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || 'Tidak ada respon dari model.',
    });
  } catch (error) {
    console.error('Error in brainstorming:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Gagal memproses brainstorming AI.',
    });
  }
});

// Admin System Metrics & Logs
app.get('/api/admin/metrics', (_req: Request, res: Response) => {
  const memory = process.memoryUsage();
  res.json({
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: {
      rss: Math.round(memory.rss / (1024 * 1024)),
      heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
      heapUsed: Math.round(memory.heapUsed / (1024 * 1024)),
    },
    services: {
      firebaseAuth: 'Aktif',
      firestore: 'Aktif',
      geminiSdk: process.env.GEMINI_API_KEY ? 'Siap (gemini-3.8-flash)' : 'Menunggu Key',
      vercelRewrite: 'Terkonfigurasi (/api/*)',
    },
    adminAccountConfigured: true,
    serverTime: new Date().toISOString(),
  });
});

// CRITICAL: Export default app without app.listen (sesuai instruksi)
export default app;
