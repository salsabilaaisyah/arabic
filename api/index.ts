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
    app: 'Al-Usrah Arabic Learning Platform',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    uptime: process.uptime(),
  });
});

// Admin Authentication endpoint (Mandatory: password '21@prill2005')
app.post('/api/auth/admin-login', (req: Request, res: Response): void => {
  const { username, password } = req.body || {};
  const ADMIN_PASSWORD = '21@prill2005';

  if (!password || password !== ADMIN_PASSWORD) {
    res.status(401).json({
      success: false,
      message: 'Password admin tidak valid! Silakan masukkan password yang benar.',
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
      displayName: `Ustadz Admin (${cleanUsername})`,
      email: cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@al-usrah.app`,
      role: 'admin',
      isCustomAdmin: true,
      lastLogin: new Date().toISOString(),
    },
    token: `token_admin_${Date.now()}_auth`,
  });
});

// AI Arabic Tutor Chat (Ustadz AI - Tema Keluarga / الأُسْرَة)
app.post('/api/ai/arabic-tutor', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userMessage, history } = req.body || {};
    if (!userMessage) {
      res.status(400).json({ error: 'Pesan pertanyaan tidak boleh kosong.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        reply: `[Mode Offline / Menunggu API Key] Terkait pertanyaan "${userMessage}": Dalam materi keluarga (الأُسْرَة), kita mengenal أَبٌ (Ayah), أُمٌّ (Ibu), أَخٌ (Saudara laki-laki), dan أُخْتٌ (Saudara perempuan). Untuk kata tunjuk, gunakan هَذَا untuk mudzakkar (هَذَا أَبِي - Ini ayahku) dan هَذِهِ untuk muannats (هَذِهِ أُمِّي - Ini ibuku).`,
      });
      return;
    }

    const systemInstruction = `
Anda adalah "Ustadz AI", tutor pembelajaran Bahasa Arab yang ramah, berwawasan luas, sabar, dan ahli dalam pedagogi bahasa Arab untuk penutur Indonesia.
Fokus Pembelajaran Utama saat ini: TEMA KELUARGA (مَوْضُوعُ الأُسْرَةِ وَالعَائِلَةِ).
Pedoman Jawaban:
1. Selalu sertakan teks Arab berharakat lengkap (fathah, kasrah, dhammah, sukun, tasydid) untuk memudahkan pemula.
2. Berikan transliterasi latin dan arti dalam bahasa Indonesia yang jelas.
3. Jelaskan kaidah tata bahasa secara sederhana (misal: dhomir kepemilikan 'Ya Mutakallim' seperti أَبِي / أُمِّي, atau isim isyarah هَذَا / هَذِهِ).
4. Berikan contoh kalimat aplikatif percakapan sehari-hari tentang keluarga.
5. Dorong siswa untuk mencoba membuat kalimat pendek atau melafalkannya.
`;

    const contents = [
      ...(Array.isArray(history)
        ? history.map((h: { role: string; content: string }) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }],
          }))
        : []),
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({
      reply: response.text || 'عَفْوًا، لَمْ أَفْهَمْ جَيِّدًا (Maaf, respon tidak dapat dihasilkan).',
    });
  } catch (error) {
    console.error('Error in arabic tutor:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Gagal menghubungi tutor AI.',
    });
  }
});

// Dynamic AI Arabic Quiz Generator (Tema Keluarga)
app.post('/api/ai/arabic-quiz', async (req: Request, res: Response): Promise<void> => {
  try {
    const { level = 'pemula', count = 5 } = req.body || {};
    const ai = getGeminiClient();

    if (!ai) {
      // Default fallback quiz items
      res.json({
        questions: [
          {
            id: 1,
            question: "Apa arti dari kata 'أَبٌ' (Abun)?",
            options: ['Ayah', 'Ibu', 'Paman', 'Kakek'],
            correctAnswer: 0,
            explanation: 'أَبٌ (Abun) artinya Ayah. Bentuk kepemilikannya: أَبِي (Ayahku).',
          },
          {
            id: 2,
            question: 'Manakah kata yang tepat untuk melengkapi: "هَذِهِ ... (Ini ibuku)"?',
            options: ['أَبِي', 'أُمِّي', 'أَخِي', 'عَمِّي'],
            correctAnswer: 1,
            explanation: 'Kata tunjuk "هَذِهِ" digunakan untuk muannats (perempuan), sehingga pasangan yang tepat adalah أُمِّي (Ibuku).',
          },
          {
            id: 3,
            question: "Apakah arti dari kata 'جَدٌّ' dan 'جَدَّةٌ'?",
            options: ['Paman dan Bibi', 'Suami dan Istri', 'Kakek dan Nenek', 'Anak Laki-laki dan Perempuan'],
            correctAnswer: 2,
            explanation: 'جَدٌّ (Jaddun) adalah Kakek, dan جَدَّةٌ (Jaddatun) adalah Nenek.',
          },
          {
            id: 4,
            question: "Bahasa Arab dari 'Saudara Perempuan' adalah...",
            options: ['أَخٌ', 'أُخْتٌ', 'بِنْتٌ', 'خَالَةٌ'],
            correctAnswer: 1,
            explanation: 'أُخْتٌ (Ukhtun) artinya Saudara Perempuan.',
          },
          {
            id: 5,
            question: 'Kalimat "هَذَا أَخِي الصَّغِيرُ" artinya adalah...',
            options: ['Ini kakak laki-lakiku', 'Ini adik laki-lakiku', 'Ini anak perempuanku', 'Ini pamanku'],
            correctAnswer: 1,
            explanation: 'أَخِي (Saudaraku) + الصَّغِيرُ (yang kecil / adik) = Ini adik laki-lakiku.',
          },
        ],
      });
      return;
    }

    const prompt = `
Buatlah ${count} soal kuis pilihan ganda interaktif untuk Pembelajaran Bahasa Arab dengan tema KELUARGA (الأُسْرَة) tingkat ${level}.
Format output WAJIB JSON murni tanpa markdown, dengan struktur:
{
  "questions": [
    {
      "id": 1,
      "question": "Pertanyaan dalam bahasa Indonesia atau teks Arab berharakat",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "correctAnswer": 0, // index 0-3 dari jawaban yang benar
      "explanation": "Penjelasan singkat kosakata & kaidah tata bahasanya"
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

    const raw = response.text || '{"questions":[]}';
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      data = match ? JSON.parse(match[0]) : { questions: [] };
    }
    res.json(data);
  } catch (error) {
    console.error('Quiz generator error:', error);
    res.status(500).json({ error: 'Gagal membuat kuis.' });
  }
});

// AI Sentence Checker (Tashih Kalimat Bahasa Arab Keluarga)
app.post('/api/ai/analyze-sentence', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sentence } = req.body || {};
    if (!sentence) {
      res.status(400).json({ error: 'Kalimat harus diisi.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        isCorrect: true,
        corrected: sentence,
        translation: 'Kalimat Anda telah dicatat.',
        feedback: 'Bagus! Terus berlatih menggunakan kosakata keluarga dalam kalimat.',
      });
      return;
    }

    const prompt = `
Periksa kalimat bahasa Arab berikut yang dibuat oleh siswa tentang tema keluarga: "${sentence}".
Berikan koreksi tata bahasa (Nahwu/Shorof), perbaikan harakat jika keliru, terjemahan Indonesia, dan saran perbaikan ramah.
Format respon JSON murni:
{
  "isCorrect": true | false,
  "original": "${sentence}",
  "corrected": "Kalimat yang telah dibenarkan harakat dan susunannya",
  "translation": "Terjemahan bahasa Indonesia yang tepat",
  "feedback": "Penjelasan tata bahasa yang mendidik dan memotivasi"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text || '{}';
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (error) {
    console.error('Error analyzing sentence:', error);
    res.status(500).json({ error: 'Gagal menganalisis kalimat.' });
  }
});

// Admin System Metrics
app.get('/api/admin/metrics', (_req: Request, res: Response) => {
  const memory = process.memoryUsage();
  res.json({
    app: 'Al-Usrah Arabic Learning Platform',
    theme: 'Materi Keluarga (الأُسْرَةِ وَالعَائِلَةِ)',
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: {
      rss: Math.round(memory.rss / (1024 * 1024)),
      heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
      heapUsed: Math.round(memory.heapUsed / (1024 * 1024)),
    },
    services: {
      firebaseProject: 'arabic-75650',
      firebaseAuth: 'Aktif (Google Sign-In + Admin)',
      firestore: 'Aktif (Per-User Security Rules)',
      geminiTutor: process.env.GEMINI_API_KEY ? 'Siap (gemini-3.8-flash)' : 'Menunggu Key',
    },
    adminAccountConfigured: true,
    serverTime: new Date().toISOString(),
  });
});

export default app;
