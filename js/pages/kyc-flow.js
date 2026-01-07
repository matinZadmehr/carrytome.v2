import { setTravelerKycRegistered } from '../utils/kyc-status.js';
import { uploadTelegramMedia } from '../utils/telegram-upload.js';

function navigateTo(route) {
  if (window.router) window.router.navigate(route);
  else window.location.hash = `#/${route}`;
}

export function initTravelerGreet() {
  const page = document.querySelector('[data-page="traveler-greet"]');
  if (!page) return;

  const startButton = page.querySelector('button[data-action="start-kyc"]');
  if (!startButton) return;

  startButton.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('flight-kyc');
  });
}

export function initFlightKyc() {
  const page = document.querySelector('[data-page="flight-kyc"]');
  if (!page) return;

  const submitButton = page.querySelector('#flight-kyc-submit');
  if (!submitButton) return;

  submitButton.addEventListener('click', async (e) => {
    e.preventDefault();

    const flightNumberInput = page.querySelector('#flight_number');
    const fileInput = page.querySelector('input[type="file"]');

    const flightNumber = flightNumberInput?.value?.trim() || '';
    const hasFile = !!fileInput?.files?.length;

    if (!flightNumber || !hasFile) {
      // Minimal feedback; the UI already has helper text.
      return;
    }

    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'در حال ارسال...';

    try {
      await uploadTelegramMedia({
        kind: 'flight-kyc-ticket',
        file: fileInput.files[0],
        caption: `Flight: ${flightNumber}`,
      });

      setTravelerKycRegistered(true);

      try {
        sessionStorage.setItem('selectedFlightNumber', flightNumber);
      } catch {
        // ignore storage errors
      }

      const hasSelectedFlight = (() => {
        try {
          return !!sessionStorage.getItem('selectedFlightId');
        } catch {
          return false;
        }
      })();

      navigateTo(hasSelectedFlight ? 'order-review' : 'registered-flight');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

export function initKycPage() {
  const page = document.querySelector('[data-page="kyc"]');
  if (!page) return;

  const submitButton = page.querySelector('#kyc-submit');
  if (!submitButton) return;

  const progressText = page.querySelector('#kyc-progress-text');
  const progressBar = page.querySelector('#kyc-progress-bar');

  const requiredDocs = [
    { id: 'id-card', kind: 'kyc-id-card', label: 'ID Card / Passport' },
    { id: 'selfie', kind: 'kyc-selfie', label: 'Selfie' },
  ];

  const filesByDocId = new Map();

  const updateUi = () => {
    const completed = requiredDocs.filter((d) => filesByDocId.has(d.id)).length;
    if (progressText) progressText.textContent = `${completed} از ${requiredDocs.length} مدرک`;
    if (progressBar) progressBar.style.width = `${Math.max((completed / requiredDocs.length) * 100, 5)}%`;

    const canSubmit = completed === requiredDocs.length;
    submitButton.disabled = !canSubmit;
    submitButton.classList.toggle('cursor-not-allowed', !canSubmit);
    submitButton.classList.toggle('bg-slate-300', !canSubmit);
    submitButton.classList.toggle('dark:bg-slate-700', !canSubmit);
    submitButton.classList.toggle('text-slate-500', !canSubmit);
    submitButton.classList.toggle('dark:text-slate-400', !canSubmit);
    submitButton.classList.toggle('bg-primary', canSubmit);
    submitButton.classList.toggle('text-white', canSubmit);
  };

  const markDocCompleted = (docId) => {
    const card = page.querySelector(`[data-kyc-doc="${docId}"]`);
    if (!card) return;

    card.classList.add('border-emerald-200');
    card.classList.remove('border-slate-100', 'border-orange-200');

    const iconWrap = card.querySelector('[data-kyc-icon]');
    if (iconWrap) {
      iconWrap.classList.remove('bg-slate-50', 'bg-orange-50', 'text-slate-400', 'text-orange-600');
      iconWrap.classList.add('bg-emerald-50', 'text-emerald-600', 'border-emerald-200');
      const icon = iconWrap.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = 'check';
    }
  };

  requiredDocs.forEach((doc) => {
    const card = page.querySelector(`[data-kyc-doc="${doc.id}"]`);
    if (!card) return;

    card.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,.pdf';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        filesByDocId.set(doc.id, file);
        markDocCompleted(doc.id);
        updateUi();
      };
      input.click();
    });
  });

  updateUi();

  submitButton.addEventListener('click', async (e) => {
    if (submitButton.disabled) return;
    e.preventDefault();

    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'در حال ارسال...';

    try {
      for (const doc of requiredDocs) {
        const file = filesByDocId.get(doc.id);
        if (!file) continue;
        await uploadTelegramMedia({
          kind: doc.kind,
          file,
          caption: doc.label,
        });
      }

      setTravelerKycRegistered(true);

      const hasSelectedFlight = (() => {
        try {
          return !!sessionStorage.getItem('selectedFlightId');
        } catch {
          return false;
        }
      })();

      navigateTo(hasSelectedFlight ? 'order-review' : 'registered-flight');
    } finally {
      submitButton.textContent = originalText;
      updateUi();
    }
  });
}
