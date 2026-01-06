// registered-cargo.js
import { saveTrip, loadTrips } from '../utils/storage.js';
import { showNotification } from '../utils/notifications.js';
import { createElement } from '../utils/dom.js';
import { addDynamicOrder,addCargoFromCard  } from '../utils/order-store.js';
import { initCargoOrderPage, showCargoOrder } from './cargo-order.js'; // We'll handle showing cargo details

initCargoOrderPage(); // initialize cargo order page

// Example cargo data (replace or extend as needed)
const CARGO_DATA = [
  { id: 1, name: 'لپ‌تاپ', weight: 2, category: 'الکترونیک', reward: 210, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq...', submitted: false },
  { id: 2, name: 'مدارک', weight: 0.5, category: 'مدارک', reward: 220, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA...', submitted: false },
  { id: 3, name: 'ساعت', weight: 0.3, category: 'ساعت', reward: 240, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg...', submitted: false }
];

let filteredCargo = [...CARGO_DATA];

/* =======================
   INIT FILTERS
======================= */
export function initRegisteredCargoFilters() {
  const page = document.querySelector('[data-page="registered-cargo"]');
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
      case 'همه': filteredCargo = [...CARGO_DATA]; break;
      case 'بیشترین پاداش': filteredCargo = [...CARGO_DATA].sort((a,b)=>b.reward - a.reward); break;
      case 'بارهای سبک': filteredCargo = CARGO_DATA.filter(c => c.weight <= 1); break;
      default: filteredCargo = [...CARGO_DATA];
    }
    renderCargo(page);
    setActive(buttons.findIndex(b => b.textContent.trim() === filterText));
  };

  buttons.forEach(btn => btn.addEventListener('click', () => applyFilter(btn.textContent.trim())));
  renderCargo(page);
}

/* =======================
   RENDER CARGO
======================= */
function renderCargo(page) {
  if (!page) return;
  const container = page.querySelector('.flex.flex-col.gap-4.px-4');
  if (!container) return;

  container.innerHTML = '';
  const savedTrips = loadTrips();

  filteredCargo.forEach(cargo => {
    // Merge submission info from storage
    const saved = savedTrips.find(t => t.submittedId === cargo.orderId || t.id === cargo.id);
    if (saved) {
      cargo.submitted = true;
      cargo.orderId = saved.submittedId;
    }
    const cargoEl = createCargoElement(cargo);
    container.appendChild(cargoEl);
  });

  if (filteredCargo.length === 0) {
    container.appendChild(createElement('div', { className: 'text-center py-8' }, `
      <span class="material-symbols-outlined text-4xl text-slate-400 mb-4">inventory</span>
      <p class="text-slate-500 dark:text-slate-400">هیچ بار تحویلی با این فیلتر یافت نشد.</p>
    `));
  }

  initCargoActions(); // always attach event delegation
}

function createCargoElement(cargo) {
  const btnClass = cargo.submitted
    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
  const btnText = cargo.submitted ? 'ثبت شده' : 'افزودن';

  return createElement('div', {
    className: 'group relative flex flex-col gap-4 rounded-2xl bg-surface-light dark:bg-surface-dark p-4 shadow-soft hover:shadow-md transition-shadow duration-300 border border-transparent dark:border-slate-800',
    'data-cargo-id': cargo.id
  }, `
    <div class="absolute top-3 left-3 z-20">
      <button class="add-to-cargo-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${btnClass}" 
              data-cargo-id="${cargo.id}" ${cargo.submitted ? 'disabled' : ''}>
        <span class="material-symbols-outlined text-[14px]">${cargo.submitted ? 'check' : 'add'}</span>
        ${btnText}
      </button>
    </div>
    <div class="flex items-start justify-between gap-4 pt-1">
      <div class="flex flex-[2] flex-col gap-3">
        <h3 class="text-slate-900 dark:text-white text-base font-bold">${cargo.name}</h3>
        <p class="text-slate-500 dark:text-slate-400 text-xs">وزن: ${cargo.weight} kg</p>
        <p class="text-slate-500 dark:text-slate-400 text-xs">پاداش: ${cargo.reward} OMR</p>
      </div>
      <div class="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden shadow-sm">
        <div class="w-full h-full bg-center bg-no-repeat bg-cover" style="background-image: url('${cargo.image}')"></div>
      </div>
    </div>
  `);
}

/* =======================
   EVENT DELEGATION
======================= */
let cargoActionsInitialized = false;

function initCargoActions() {
  if (cargoActionsInitialized) return;
  cargoActionsInitialized = true;

  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('button.add-to-cargo-btn');
    if (addBtn) {
      const id = addBtn.dataset.cargoId;
      console.log('✅ add-to-cargo-btn clicked', id);
      e.preventDefault();
      toggleCargoSubmission(id, addBtn);
    }

    const viewBtn = e.target.closest('button[data-route="cargo-order"]');
    if (viewBtn) {
      const id = viewBtn.dataset.orderId;
      console.log('🔎 view cargo order', id);
      e.preventDefault();
      showCargoOrder(id);
      if (window.router) window.router.navigate('cargo-order');
    }
  });
}

/* =======================
   SUBMISSION HANDLER
======================= */
function toggleCargoSubmission(cargoId, button) {
  const cargo = CARGO_DATA.find(c => c.id == cargoId);
  if (!cargo || cargo.submitted) return;

  cargo.submitted = true;
  button.dataset.submitted = "true";
  button.disabled = true;
  button.classList.remove('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-200', 'dark:border-slate-700', 'text-slate-700', 'dark:text-slate-300');
  button.classList.add('bg-emerald-500', 'hover:bg-emerald-600', 'text-white');
  button.innerHTML = '<span class="material-symbols-outlined text-[14px]">check</span> ثبت شده';

  const uuid = crypto.randomUUID();
  cargo.orderId = uuid;

  const tripData = { ...cargo, submittedDate: new Date().toISOString(), status: 'submitted', submittedId: uuid };
  saveTrip(tripData);

  addDynamicOrder({
    id: `cargo-${uuid}`,
    type: 'cargo',
    dateISO: new Date().toISOString(),
    statusText: 'در دسترس',
    statusColor: 'emerald',
    from: 'تهران (IKA)',
    to: 'دبی (DXB)',
    action: 'افزودن به سفارش‌ها',
    description: cargo.name,
    price: cargo.reward,
    category: cargo.category,
    details: { price: cargo.reward, category: cargo.category, description: cargo.name }
  });

  showNotification(`${cargo.name} به سفارش‌ها اضافه شد`, 'success');
}

document.querySelector('[data-page="registered-cargo"]')
  .addEventListener('click', e => {
    const btn = e.target.closest('.add-to-cargo-btn');
    if (!btn) return;

    const card = btn.closest('.group');
    addCargoFromCard(card);
    alert('سفارش با موفقیت اضافه شد!');
  });
/* =======================
   INITIALIZE
======================= */
document.addEventListener('DOMContentLoaded', () => {
  initRegisteredCargoFilters(); // render and attach filters
});
