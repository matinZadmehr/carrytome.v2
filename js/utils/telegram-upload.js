export async function uploadTelegramMedia({ kind, file, caption, initData }) {
  if (!file) throw new Error('Missing file');
  if (!kind) throw new Error('Missing kind');

  const resolveUploadUrl = () => {
    const override =
      globalThis.__TELEGRAM_UPLOAD_URL__ ||
      globalThis.__TELEGRAM_UPLOAD_BASE__;
    if (typeof override === 'string' && override.trim()) {
      const trimmed = override.trim();
      if (trimmed.endsWith('/api/telegram/upload')) return trimmed;
      return `${trimmed.replace(/\/+$/, '')}/api/telegram/upload`;
    }

    // Common local dev: VSCode Live Server on :5500, proxy runs on :8787
    if (
      globalThis.location?.hostname &&
      (globalThis.location.hostname === '127.0.0.1' || globalThis.location.hostname === 'localhost') &&
      globalThis.location.port === '5500'
    ) {
      return `${globalThis.location.protocol}//${globalThis.location.hostname}:8787/api/telegram/upload`;
    }

    // Default: same-origin (recommended for production)
    return '/api/telegram/upload';
  };

  const telegramInitData =
    initData ??
    (globalThis.Telegram?.WebApp?.initData
      ? String(globalThis.Telegram.WebApp.initData)
      : '');

  const form = new FormData();
  form.append('initData', telegramInitData);
  form.append('kind', String(kind));
  if (caption) form.append('caption', String(caption));
  form.append('file', file, file.name || 'upload');

  const response = await fetch(resolveUploadUrl(), {
    method: 'POST',
    body: form,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    const message = data?.error || data?.description || `Upload failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}
