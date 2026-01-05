// registered-flight.js
import { saveTrip, loadTrips, removeTrip } from '../utils/storage.js';
import { showNotification } from '../utils/notifications.js';
import { createElement } from '../utils/dom.js';
import { addDynamicOrder } from '../utils/order-store.js';
import { showFlightOrder, initFlightOrderPage } from './flight-order.js';

initFlightOrderPage();

const FLIGHT_DATA = [
  { id: 1, fromCode: 'THR', toCode: 'DXB', route: 'تهران به دبی', date: '۱۲ مهر', timeFrom: '10:30', timeTo: '13:15', cargo: 'لپ‌تاپ (۲ کیلوگرم)', cargoIcon: 'luggage', reward: '۲۱۰ OMR', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq...', alt: 'Modern skyline of Dubai', verified: true, weight: 2, rewardValue: 210, dateValue: 12 },
  { id: 2, fromCode: 'IST', toCode: 'LHR', route: 'تهران به مسقط', date: '۱۵ مهر', timeFrom: '11:00', timeTo: '14:30', cargo: 'مدارک (۰.۵ کیلوگرم)', cargoIcon: 'description', reward: '۲۲۰ OMR', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA...', alt: 'Iconic Big Ben', verified: true, weight: 0.5, rewardValue: 220, dateValue: 15 },
  { id: 3, fromCode: 'DXB', toCode: 'JFK', route: 'مسقط به تهران', date: '۱۸ مهر', timeFrom: '12:00', timeTo: '20:00', cargo: 'ساعت (۰.۳ کیلوگرم)', cargoIcon: 'watch', reward: '۲۴۰ OMR', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg...', alt: 'New York City', verified: false, weight: 0.3, rewardValue: 240, dateValue: 18 }
];

let filteredFlights = [...FLIGHT_DATA];
let currentFilter = 'all';

/* =======================
   FILTER BUTTONS
======================= */
export function initRegisteredFlightFilters() {
  const page = document.querySelector('[data-page="registered-flight"]');
  if (!page) return;

  const buttons = Array.from(page.querySelectorAll('div.flex.gap-3.px-4.pb-4 button'));
  const setActive = (activeIndex) => {
  buttons.forEach((btn, idx) => {
    btn.classList.remove('bg-slate-900', 'dark:bg-white');
    const span = btn.querySelector('span');
    if (idx === activeIndex) {
      btn.classList.add('bg-slate-900', 'dark:bg-white');
      if (span) { span.classList.add('text-white', 'dark:text-slate-900'); span.classList.remove('text-slate-600', 'dark:text-slate-300'); }
    } else {
      if (span) { span.classList.remove('text-white', 'dark:text-slate-900'); span.classList.add('text-slate-600', 'dark:text-slate-300'); }
    }
  });
};

  const applyFilter = (filterText) => {
    switch (filterText) {
      case 'همه': filteredFlights = [...FLIGHT_DATA]; break;
      case 'بیشترین پاداش': filteredFlights = [...FLIGHT_DATA].sort((a,b)=>b.rewardValue-a.rewardValue); break;
      case 'نزدیک‌ترین زمان': filteredFlights = [...FLIGHT_DATA].sort((a,b)=>a.dateValue-b.dateValue); break;
      case 'بارهای سبک': filteredFlights = FLIGHT_DATA.filter(f=>f.weight<=1); break;
      default: filteredFlights = [...FLIGHT_DATA];
    }
    renderFlights(page);
    setActive(buttons.findIndex(b => b.textContent.trim() === filterText));
  };

  buttons.forEach(btn => btn.addEventListener('click', () => applyFilter(btn.textContent.trim())));
  renderFlights(page); // initial render
}

/* =======================
   RENDER FLIGHTS
======================= */
function renderFlights(page) {
  if (!page) return;
  const container = page.querySelector('.flex.flex-col.gap-4.px-4');
  if (!container) return;

  container.innerHTML = '';

  const savedTrips = loadTrips(); // flights already in localStorage

  filteredFlights.forEach(flight => {
    flight.submitted = savedTrips.some(trip => trip.id == flight.id); // mark submitted if saved
    const flightEl = createFlightElement(flight);
    container.appendChild(flightEl);
  });

  if (filteredFlights.length === 0) {
    container.appendChild(createElement('div', { className: 'text-center py-8' }, `
      <span class="material-symbols-outlined text-4xl text-slate-400 mb-4">flight</span>
      <p class="text-slate-500 dark:text-slate-400">هیچ فرصت تحویلی با این فیلتر یافت نشد.</p>
    `));
  }

  initFlightActions(page);
}

function createFlightElement(flight) {
  const addButtonClass = flight.submitted
    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';

  const addButtonIcon = flight.submitted ? 'check' : 'add';
  const addButtonText = flight.submitted ? 'ثبت شده' : 'افزودن';

  return createElement('div', {
    className: 'group relative flex flex-col gap-4 rounded-2xl bg-surface-light dark:bg-surface-dark p-4 shadow-soft hover:shadow-md transition-shadow duration-300 border border-transparent dark:border-slate-800',
    'data-flight-id': flight.id
  }, `
    <div class="absolute top-3 left-3 z-20">
      <button class="add-to-trip-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${addButtonClass} shadow-sm active:scale-95" 
              data-flight-id="${flight.id}" data-submitted="${flight.submitted}" ${flight.submitted ? 'disabled' : ''}>
        <span class="material-symbols-outlined text-[14px]">${addButtonIcon}</span>
        ${addButtonText}
      </button>
    </div>
    <div class="flex items-start justify-between gap-4 pt-1">
      <div class="flex flex-[2] flex-col gap-3">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <h3 class="text-slate-900 dark:text-white text-base font-bold leading-tight font-display">
              ${flight.fromCode} <span class="text-slate-400 mx-1 text-xs">✈️</span> ${flight.toCode}
            </h3>
          </div>
          <p class="text-slate-500 dark:text-slate-400 text-xs font-normal">${flight.route}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <span class="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-300">
            <span class="material-symbols-outlined text-[12px]">calendar_today</span>
            ${flight.date}
          </span>
          <span class="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-300">
            <span class="material-symbols-outlined text-[12px]">${flight.cargoIcon}</span>
            ${flight.cargo}
          </span>
        </div>
        <div class="mt-1">
          <button id="view-flight" class="flex w-full items-center justify-between rounded-xl h-10 px-4 bg-primary/10 hover:bg-primary/20 text-primary transition-colors" 
                  data-route="flight-order" type="button" 
                  data-flight-id="${flight.id}" 
                  data-order-id="${flight.orderId || ''}">
            <span class="font-bold text-sm">${flight.reward}</span>
            <div class="flex items-center gap-1 text-xs font-medium">
              مشاهده
              <span class="material-symbols-outlined text-[16px] rtl:rotate-180">arrow_right_alt</span>
            </div>
          </button>
        </div>
      </div>
      <div class="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden shadow-sm">
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
        <div class="w-full h-full bg-center bg-no-repeat bg-cover" style="background-image: url('${flight.image}')"></div>
        ${flight.verified ? `<div class="absolute bottom-1 right-1 z-20"><span class="material-symbols-outlined text-white text-[14px]">verified_user</span></div>` : ''}
      </div>
    </div>
  `);
}



/* =======================
   FLIGHT ACTIONS
======================= */
function initFlightActions(page) {
  // Add/remove from trips & show order details
  page.addEventListener('click', (e) => {
    const addButton = e.target.closest('.add-to-trip-btn');
    if (addButton) {
      e.preventDefault();
      e.stopPropagation();
      const flightId = addButton.dataset.flightId;
      toggleFlightSubmission(flightId, addButton);
      return;
    }

    const viewButton = e.target.closest('button[data-route="flight-order"]');
    if (viewButton) {
      e.preventDefault();
      const flightId = viewButton.dataset.flightId;
      if (flightId) {
        showFlightOrder(flightId); // <-- show flight order page
        if (window.router) window.router.navigate('flight-order');
      }
    }
  });
}


function toggleFlightSubmission(flightId, button) {
  const flight = FLIGHT_DATA.find(f => f.id == flightId);
  if (!flight) return;

  if (!flight.submitted) {
    flight.submitted = true;
    button.dataset.submitted = "true";
    button.disabled = true;
    button.classList.remove('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-200', 'dark:border-slate-700', 'text-slate-700', 'dark:text-slate-300');
    button.classList.add('bg-emerald-500', 'hover:bg-emerald-600', 'text-white');
    button.innerHTML = '<span class="material-symbols-outlined text-[14px]">check</span> ثبت شده';

    const tripData = { ...flight, submittedDate: new Date().toISOString(), status: 'submitted', submittedId: Date.now() + '-' + flight.id };
    saveTrip(tripData);

    addDynamicOrder({
      id: `flight-${flight.id}`,
      type: 'flight',
      dateISO: new Date().toISOString(),
      statusText: 'در دسترس',
      statusColor: 'emerald',
      from: flight.fromCode,
      to: flight.toCode,
      action: 'افزودن به سفارش‌ها',
      description: flight.route,
      price: flight.rewardValue,
      category: extractCategoryFromCargo(flight.cargo),
      details: { price: flight.reward, category: extractCategoryFromCargo(flight.cargo), description: flight.cargo }
    });

    showNotification(`سفر ${flight.fromCode} → ${flight.toCode} به سفرهای من اضافه شد`, 'success');
  }
}

/* =======================
   HELPER
======================= */
function extractCategoryFromCargo(cargo) {
  if (cargo.toLowerCase().includes('لپ')) return 'الکترونیک';
  if (cargo.toLowerCase().includes('مدارک')) return 'مدارک';
  if (cargo.toLowerCase().includes('ساعت')) return 'ساعت';
  return 'سایر';
}
