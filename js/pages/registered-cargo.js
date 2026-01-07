import { getTravelerListings } from '../utils/traveler-listings.js';
import { addOrder } from '../components/cart.js';
import { showNotification } from '../utils/notifications.js';

const CARGO_CATEGORY_NAMES = [
  'فلزات ارزشمند',
  'اسناد و مدارک',
  'الکترونیکی',
  'پزشکی و بهداشتی',
  'کالای شکستنی',
  'سایر موارد',
];

function readRoute(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function readStoredValue(key) {
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
}

function readStoredJson(key, fallbackValue) {
  try {
    const raw = readStoredValue(key);
    if (!raw) return fallbackValue;
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function extractAirportCode(text) {
  if (typeof text !== 'string') return null;
  const paren = text.match(/\(([A-Z]{3})\)/);
  if (paren) return paren[1];
  const any = text.match(/\b[A-Z]{3}\b/);
  return any ? any[0] : null;
}

function normalizeCode(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toUpperCase();
}

function matchesRoute(listing, route) {
  if (!route?.origin || !route?.destination) return true;
  const originCode = normalizeCode(route.originCode || extractAirportCode(route.origin) || route.origin);
  const destinationCode = normalizeCode(
    route.destinationCode || extractAirportCode(route.destination) || route.destination
  );
  if (!originCode || !destinationCode) return true;
  return (
    normalizeCode(listing.originCode || extractAirportCode(listing.origin) || listing.origin) === originCode &&
    normalizeCode(
      listing.destinationCode || extractAirportCode(listing.destination) || listing.destination
    ) === destinationCode
  );
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('fa-IR', { day: '2-digit', month: 'long' });
  } catch {
    return '';
  }
}

function createTravelerCard(listing) {
  const dateLabel = listing.dateISO ? `تاریخ: ${formatDate(listing.dateISO)}` : '';
  const timeLabel = listing.time ? `ساعت: ${listing.time}` : '';

  return `
    <div class="group relative flex flex-col gap-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="relative">
            <img alt="Profile picture of traveler"
              class="size-12 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
              src="${listing.profileImage}" />
            ${
              listing.verified
                ? `<div class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-slate-800">
                    <span class="material-symbols-outlined text-primary text-[16px] filled">verified</span>
                  </div>`
                : ''
            }
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-300">
              <span class="material-symbols-outlined text-amber-400 text-[16px] fill-1" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="font-medium">${Number(listing.rating || 0).toFixed(1)}</span>
              <span>•</span>
              <span class="font-medium text-slate-500 dark:text-slate-400">${listing.completedDeliveries} حمل موفق</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <span class="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full">${listing.capacityLabel}</span>
        </div>
      </div>

      <div class="relative flex items-center justify-between rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
        <div class="flex flex-col items-center z-10">
          <span class="text-xl font-black text-slate-900 dark:text-white tracking-wider">${listing.originCode || '---'}</span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${listing.origin || ''}</span>
        </div>
        <div class="flex flex-1 flex-col items-center px-4 relative">
          <div class="text-[10px] font-medium text-slate-400 mb-1">${listing.duration || ''}</div>
          <div class="w-full h-[2px] bg-slate-200 dark:bg-slate-700 relative flex items-center justify-center">
            <div class="absolute bg-white dark:bg-slate-900 px-1">
              <span class="material-symbols-outlined text-primary rotate-[270deg] text-[20px]">flight</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center z-10">
          <span class="text-xl font-black text-slate-900 dark:text-white tracking-wider">${listing.destinationCode || '---'}</span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${listing.destination || ''}</span>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2 pt-1">
          <div class="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1.5">
            <span class="material-symbols-outlined text-slate-500 dark:text-slate-300 text-[16px]">calendar_today</span>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-200">${dateLabel || '—'}</span>
          </div>
          <div class="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1.5">
            <span class="material-symbols-outlined text-slate-500 dark:text-slate-300 text-[16px]">schedule</span>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-200">${timeLabel || '—'}</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-1">
          <button data-cargo-id="${listing.id}"
            class="view-cargo h-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95"
            data-route="cargo-order">
            مشاهده جزئیات
          </button>
          <button data-cargo-id="${listing.id}"
            class="add-to-cargo-btn flex h-10 items-center justify-center rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 transition-all hover:bg-blue-600 active:scale-95">
            قبول درخواست
          </button>
        </div>
      </div>
    </div>
  `;
}

function buildCargoRequestOrder(route) {
  const origin = route?.origin?.trim();
  const destination = route?.destination?.trim();
  if (!origin || !destination) return null;

  const weight = readStoredValue('cargoWeight');
  const value = readStoredValue('cargoValue');
  const categoryIndexes = readStoredJson('cargoCategories', []);
  const categories = Array.isArray(categoryIndexes)
    ? categoryIndexes
        .map((idx) => CARGO_CATEGORY_NAMES[Number(idx)])
        .filter(Boolean)
    : [];

  const itemLabel = categories[0] || 'مرسوله';
  const details = {
    item: itemLabel,
    ...(weight ? { weight } : {}),
    ...(value ? { value } : {}),
    ...(categories.length ? { category: categories.join('، '), categories } : {}),
    createdVia: 'notify-me',
  };

  return {
    type: 'sender',
    from: origin,
    to: destination,
    date: new Date().toISOString().slice(0, 10),
    status: 'در انتظار تایید',
    statusColor: 'amber',
    item: itemLabel,
    details,
  };
}

export function initRegisteredCargoPage() {
  const page = document.querySelector('[data-page="registered-cargo"]');
  if (!page) return;

  const container = page.querySelector('.flex.flex-col.gap-8.px-5.pb-24.mt-6');
  if (!container) return;

  const route = readRoute('currentCargoRoute') || readRoute('cargoRoute');

  if (!page.dataset.notifyInitialized) {
    page.dataset.notifyInitialized = 'true';
    page.addEventListener('click', (e) => {
      const notifyButton = e.target.closest('button[data-action="notify-me"]');
      if (!notifyButton) return;

      e.preventDefault();
      const currentRoute = readRoute('currentCargoRoute') || readRoute('cargoRoute') || route;
      const order = buildCargoRequestOrder(currentRoute);
      if (!order) {
        showNotification('لطفاً ابتدا مبدا و مقصد را مشخص کنید.', 'warning');
        return;
      }

      const added = addOrder(order);
      if (added) {
        showNotification('درخواست شما ثبت شد و به مسافران نمایش داده می‌شود.', 'success');
      } else {
        showNotification('این درخواست قبلاً ثبت شده است.', 'info');
      }

      notifyButton.disabled = true;
      notifyButton.classList.add('opacity-60');
    });
  }

  const render = () => {
    const all = getTravelerListings();
    const filtered = all.filter((listing) => matchesRoute(listing, route));

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="text-center py-10">
          <span class="material-symbols-outlined text-4xl text-slate-400 mb-3">travel_explore</span>
          <p class="text-slate-600 dark:text-slate-300 font-bold">مسافری برای این مسیر پیدا نشد</p>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">اول یک سفر توسط مسافر ثبت کنید.</p>
        </div>
      `;

      const origin = escapeHtml(route?.origin || 'تهران');
      const destination = escapeHtml(route?.destination || 'استانبول');
      container.insertAdjacentHTML(
        'beforeend',
        `
          <div class="mt-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-5 text-center">
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <span class="material-symbols-outlined text-primary text-[24px]">notifications_active</span>
            </div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">پرواز مناسبی پیدا نکردید؟</h3>
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
              به محض اینکه مسافر جدیدی برای مسیر ${origin} به ${destination} پیدا شود، به شما خبر می‌دهیم.
            </p>
            <button
              type="button"
              data-action="notify-me"
              class="w-full h-10 rounded-full bg-white dark:bg-slate-800 text-primary font-bold text-sm border border-primary/20 shadow-sm hover:bg-slate-50 transition-colors">
              خبرم کن
            </button>
          </div>
        `
      );
      return;
    }

    container.innerHTML = filtered.map(createTravelerCard).join('');
  };

  render();
  window.addEventListener('traveler-listings-updated', render);
}
