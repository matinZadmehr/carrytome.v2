import { getOrders } from '../components/cart.js';
import { createElement } from '../utils/dom.js';
import { showFlightOrder, initFlightOrderPage } from './flight-order.js';
import { initFlightOrderSubmission } from '../utils/flight-order-submission.js';

initFlightOrderPage();
initFlightOrderSubmission();

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

function readTravelerRoute() {
  try {
    return JSON.parse(sessionStorage.getItem('currentTravelerRoute') || localStorage.getItem('travelerRoute') || 'null');
  } catch {
    return null;
  }
}

function matchesTravelerRoute(order, route) {
  if (!route?.origin || !route?.destination) return true;
  const originCode = normalizeCode(extractAirportCode(route.origin) || route.originCode || route.origin);
  const destinationCode = normalizeCode(
    extractAirportCode(route.destination) || route.destinationCode || route.destination
  );
  if (!originCode || !destinationCode) return true;
  const fromCode = normalizeCode(extractAirportCode(order.from) || order.from);
  const toCode = normalizeCode(extractAirportCode(order.to) || order.to);
  return fromCode === originCode && toCode === destinationCode;
}

function parseNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const match = value.replace(/,/g, '').match(/[\d.]+/);
  return match ? Number(match[0]) || 0 : 0;
}

function cargoIconFor(order) {
  const text = `${order.details?.item || ''} ${order.details?.category || ''}`.toLowerCase();
  if (text.includes('لپ') || text.includes('laptop')) return 'laptop_mac';
  if (text.includes('مدار') || text.includes('passport') || text.includes('document')) return 'description';
  if (text.includes('ساعت') || text.includes('watch')) return 'watch';
  return 'inventory_2';
}

function mapOrderToCard(order) {
  const fromCode = extractAirportCode(order.from) || '---';
  const toCode = extractAirportCode(order.to) || '---';
  const date = order.date || order.details?.date || '';
  const weightValue = parseNumber(order.details?.weight || order.details?.baggage || '');
  const rewardValue = parseNumber(order.details?.value || order.details?.price || order.price || '');

  const item = order.details?.item || order.item || order.details?.description || order.description || 'مرسوله';
  const cargo = weightValue ? `${item} (${weightValue} کیلوگرم)` : `${item}`;

  const rewardText = rewardValue ? `${rewardValue} OMR` : '—';

  const dateValue = (() => {
    try {
      const parsed = new Date(date);
      return Number.isNaN(parsed.getTime()) ? Number.MAX_SAFE_INTEGER : parsed.getTime();
    } catch {
      return Number.MAX_SAFE_INTEGER;
    }
  })();

  return {
    id: order.id,
    orderId: order.id,
    fromCode,
    toCode,
    route: `${order.from} به ${order.to}`,
    date,
    cargo,
    cargoIcon: cargoIconFor(order),
    reward: rewardText,
    image: 'asset/images/logo.jpg',
    verified: true,
    weight: weightValue || 0,
    rewardValue: rewardValue || 0,
    dateValue,
  };
}

function getRequestOrders() {
  const all = getOrders();
  // Show sender/cargo requests (exclude internal flight records)
  return all.filter((o) => o && (o.type === 'sender' || o.type === 'cargo' || o.type === 'carrier'));
}

let filteredFlights = [];

export function initRegisteredFlightFilters() {
  const page = document.querySelector('[data-page="registered-flight"]');
  if (!page) return;

  const route = readTravelerRoute();
  const orders = getRequestOrders().filter((o) => matchesTravelerRoute(o, route));
  const base = orders.map(mapOrderToCard);
  filteredFlights = [...base];

  const buttons = Array.from(page.querySelectorAll('div.flex.gap-3.px-4.pb-4 button'));
  const setActive = (activeIndex) => {
    buttons.forEach((btn, idx) => {
      btn.classList.remove('bg-slate-900', 'dark:bg-white');
      const span = btn.querySelector('span');
      if (idx === activeIndex) {
        btn.classList.add('bg-slate-900', 'dark:bg-white');
        if (span) {
          span.classList.add('text-white', 'dark:text-slate-900');
          span.classList.remove('text-slate-600', 'dark:text-slate-300');
        }
      } else {
        if (span) {
          span.classList.remove('text-white', 'dark:text-slate-900');
          span.classList.add('text-slate-600', 'dark:text-slate-300');
        }
      }
    });
  };

  const applyFilter = (filterText) => {
    switch (filterText) {
      case 'همه':
        filteredFlights = [...base];
        break;
      case 'بیشترین پاداش':
        filteredFlights = [...base].sort((a, b) => b.rewardValue - a.rewardValue);
        break;
      case 'نزدیک‌ترین زمان':
        filteredFlights = [...base].sort((a, b) => a.dateValue - b.dateValue);
        break;
      case 'بارهای سبک':
        filteredFlights = base.filter((f) => f.weight > 0 && f.weight <= 1);
        break;
      default:
        filteredFlights = [...base];
    }
    renderFlights(page);
    setActive(buttons.findIndex((b) => b.textContent.trim() === filterText));
  };

  buttons.forEach((btn) => btn.addEventListener('click', () => applyFilter(btn.textContent.trim())));
  renderFlights(page);
}

function renderFlights(page) {
  const container = page.querySelector('.flex.flex-col.gap-4.px-4');
  if (!container) return;

  container.innerHTML = '';

  filteredFlights.forEach((flight) => {
    container.appendChild(createFlightElement(flight));
  });

  if (filteredFlights.length === 0) {
    container.appendChild(
      createElement(
        'div',
        { className: 'text-center py-8' },
        `
          <span class="material-symbols-outlined text-4xl text-slate-400 mb-4">inbox</span>
          <p class="text-slate-600 dark:text-slate-300 font-bold">درخواستی برای این مسیر پیدا نشد</p>
          
        `
      )
    );
  }

  initFlightActions();
}

function createFlightElement(flight) {
  return createElement(
    'div',
    {
      className:
        'group relative flex flex-col gap-4 rounded-2xl bg-surface-light dark:bg-surface-dark p-4 shadow-soft hover:shadow-md transition-shadow duration-300 border border-transparent dark:border-slate-800',
      'data-flight-id': flight.id,
    },
    `
    <div class="flex items-start justify-between gap-4">
      <div class="flex flex-[2] flex-col gap-3">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <h3 class="text-slate-900 dark:text-white text-base font-bold leading-tight font-display">
              ${flight.fromCode} <span class="text-slate-400 mx-1 text-xs">→</span> ${flight.toCode}
            </h3>
          </div>
          <p class="text-slate-500 dark:text-slate-400 text-xs font-normal">${flight.route}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <span class="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-300">
            <span class="material-symbols-outlined text-[12px]">calendar_today</span>
            ${flight.date || '—'}
          </span>
          <span class="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-300">
            <span class="material-symbols-outlined text-[12px]">${flight.cargoIcon}</span>
            ${flight.cargo}
          </span>
        </div>
        <div class="mt-1 grid grid-cols-3 gap-3">
        <span class="font-bold text-sm block">${flight.reward}</span>
          <button
            class="w-full rounded-xl px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-right"
            data-route="flight-order"
            data-order-id="${flight.orderId || ''}"
            type="button">
            <div class="mt-1 flex items-center justify-end gap-1 text-xs font-medium">
              مشاهده
              <span class="material-symbols-outlined text-[16px] rtl:rotate-180">arrow_right_alt</span>
            </div>
          </button>
          <button data-flight-id="${flight.id}"
            class="add-to-trip-btn flex items-center justify-center rounded-xl h-10 px-4 bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all text-xs font-bold">
            قبول درخواست
          </button>
        </div>
      </div>
      <div class="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden shadow-sm">
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
        <div class="w-full h-full bg-center bg-no-repeat bg-cover" style="background-image: url('${flight.image}')"></div>
        ${
          flight.verified
            ? `<div class="absolute bottom-1 right-1 z-20"><span class="material-symbols-outlined text-white text-[14px]">verified_user</span></div>`
            : ''
        }
      </div>
    </div>
  `
  );
}

let flightActionsInitialized = false;
function initFlightActions() {
  if (flightActionsInitialized) return;
  flightActionsInitialized = true;

  document.addEventListener('click', (e) => {
    const viewButton = e.target.closest('button[data-route="flight-order"]');
    if (viewButton) {
      e.preventDefault();
      showFlightOrder(viewButton.dataset.orderId);
      if (window.router) window.router.navigate('flight-order');
    }
  });
}
