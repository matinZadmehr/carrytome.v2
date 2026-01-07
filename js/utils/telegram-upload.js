export async function uploadTelegramMedia({ kind, file, caption, initData }) {
  if (!file) throw new Error('Missing file');
  if (!kind) throw new Error('Missing kind');

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

  const response = await fetch('/api/telegram/upload', {
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

