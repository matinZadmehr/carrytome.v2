import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from "dotenv";
dotenv.config();


const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TARGET_CHAT_ID = process.env.TELEGRAM_TARGET_CHAT_ID || null;
const PORT = Number(process.env.PORT || 8787);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');

if (!BOT_TOKEN) {
  console.warn('Missing env TELEGRAM_BOT_TOKEN (required).');
}

const app = express();
app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

function verifyTelegramWebAppInitData(initData, botToken) {
  if (!initData || !botToken) return { ok: false, error: 'Missing initData or bot token' };

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, error: 'Missing hash in initData' };
  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculated = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hash))) {
    return { ok: false, error: 'Invalid initData hash' };
  }

  const userRaw = params.get('user');
  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    user = null;
  }

  const authDate = Number(params.get('auth_date') || 0);
  return { ok: true, user, authDate };
}

function pickSendMethod(mimeType) {
  if (mimeType?.startsWith('image/')) return 'sendPhoto';
  return 'sendDocument';
}

app.post('/api/telegram/upload', upload.single('file'), async (req, res) => {
  try {
    if (!BOT_TOKEN) return res.status(500).json({ ok: false, error: 'Server not configured' });
    if (!req.file) return res.status(400).json({ ok: false, error: 'Missing file' });

    const initData = String(req.body?.initData || '');
    const kind = String(req.body?.kind || 'upload');
    const caption = String(req.body?.caption || kind);

    let chatId = TARGET_CHAT_ID;
    if (!chatId) {
      const verified = verifyTelegramWebAppInitData(initData, BOT_TOKEN);
      if (!verified.ok) return res.status(401).json({ ok: false, error: verified.error });
      const userId = verified.user?.id;
      if (!userId) return res.status(401).json({ ok: false, error: 'Missing user in initData' });
      chatId = String(userId);
    }

    const method = pickSendMethod(req.file.mimetype);
    const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('caption', caption);
    form.append('disable_content_type_detection', 'true');

    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'application/octet-stream' });
    if (method === 'sendPhoto') {
      form.append('photo', blob, req.file.originalname || 'photo');
    } else {
      form.append('document', blob, req.file.originalname || 'document');
    }

    const telegramRes = await fetch(apiUrl, { method: 'POST', body: form });
    const telegramData = await telegramRes.json().catch(() => null);

    if (!telegramRes.ok || !telegramData?.ok) {
      return res.status(502).json({
        ok: false,
        error: telegramData?.description || `Telegram API error (${telegramRes.status})`,
      });
    }

    return res.json({ ok: true, result: telegramData.result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
});

// Serve the mini app from the same origin as the API (simplifies local dev).
app.use(express.static(webRoot));
app.get('*', (req, res) => {
  res.sendFile(path.join(webRoot, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Telegram upload proxy listening on http://localhost:${PORT}`);
});
