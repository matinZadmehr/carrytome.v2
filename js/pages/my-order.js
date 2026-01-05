import { delegateEvent, createElement } from '../utils/dom.js';
import { showOrderDetailsModal } from './modals.js';
import { getDynamicOrders } from '../utils/order-store.js';

/* =====================
   STATE
===================== */
let currentFilter = 'all';
let currentSort = 'newest';
let filteredOrders = [];
let searchQuery = '';

/* =====================
   HELPERS
===================== */
function getAllOrders() {
  // Get dynamic orders from store
  const dynamic = getDynamicOrders();
  console.log('📦 Dynamic orders from store:', dynamic);

  // Enrich carrier/traveler orders with flight info
  const enrichedDynamic = dynamic.map(order => {
    if (order.type === 'carrier' || order.type === 'traveler') {
      return {
        ...order,
        flightDate: order.details?.flightDate || order.dateISO || '—',
        flightTime: order.details?.flightTime || '—',
        travelerCapacity: order.details?.capacity || '—'
      };
    }
    return order; // sender orders remain unchanged
  });

  // Optionally, include static flight orders if you have any
  // const flightOrders = getFlightOrders(); // if implemented
  // return [...enrichedDynamic, ...flightOrders];

  return enrichedDynamic;
}

function sortOrders(list) {
  return [...list].sort((a, b) => {
    const da = new Date(a.dateISO);
    const db = new Date(b.dateISO);
    return currentSort === 'newest' ? db - da : da - db;
  });
}

/* =====================
   INIT
===================== */
export function initMyOrderPage() {
  const page = document.querySelector('[data-page="my-order"]');
  if (!page) return;

  console.log('Initializing My Order page...');

  window.addEventListener('orders-updated', handleOrdersUpdated);

  initTabs(page);
  initSort(page);
  initSearch(page);
  initOrderClickHandlers(page);
  initRefreshButton(page);

  applyFilter('all');
}

function handleOrdersUpdated() {
  console.log('Orders updated event received');
  applyFilter(currentFilter);
}

/* =====================
   FILTER TABS
===================== */
function initTabs(page) {
  delegateEvent(page, 'click', '[data-filter]', e => {
    const btn = e.target.closest('[data-filter]');
    console.log('Filter button clicked:', btn.dataset.filter);
    applyFilter(btn.dataset.filter);
    updateTabs(page, btn.dataset.filter);
  });
}

function applyFilter(filter) {
  console.log('Applying filter:', filter);
  currentFilter = filter;

  let orders = getAllOrders();
  console.log('Total orders before filtering:', orders.length);

  if (filter !== 'all') {
    const filterMap = {
      'sender': 'sender',
      'carrier': 'carrier',
      'traveler': 'traveler',
      'flight': 'flight'
    };
    const orderType = filterMap[filter];
    if (orderType) orders = orders.filter(o => o.type === orderType);
  }

  if (searchQuery) {
    orders = orders.filter(o =>
      `${o.from} ${o.to} ${o.action} ${o.type} ${o.description || ''}`
        .toLowerCase()
        .includes(searchQuery)
    );
  }

  filteredOrders = sortOrders(orders);
  console.log('Orders after filtering:', filteredOrders.length);
  renderOrders();
}

function updateTabs(page, active) {
  page.querySelectorAll('[data-filter]').forEach(btn => {
    const isActive = btn.dataset.filter === active;
    btn.classList.toggle('bg-white', isActive);
    btn.classList.toggle('dark:bg-slate-600', isActive);
    btn.classList.toggle('text-primary', isActive);
    btn.classList.toggle('text-slate-500', !isActive);
    btn.classList.toggle('dark:text-slate-400', !isActive);
  });
}

/* =====================
   SORT
===================== */
function initSort(page) {
  const select = page.querySelector('[data-sort]');
  if (!select) return;

  select.addEventListener('change', e => {
    currentSort = e.target.value;
    filteredOrders = sortOrders(filteredOrders);
    renderOrders();
  });
}

/* =====================
   SEARCH
===================== */
function initSearch(page) {
  const input = page.querySelector('[data-search]');
  if (!input) return;

  input.addEventListener('input', e => {
    searchQuery = e.target.value.trim().toLowerCase();
    applyFilter(currentFilter);
  });
}

/* =====================
   REFRESH BUTTON
===================== */
function initRefreshButton(page) {
  const refreshBtn = page.querySelector('[data-refresh]');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.classList.add('animate-spin');
      setTimeout(() => {
        applyFilter(currentFilter);
        refreshBtn.classList.remove('animate-spin');
      }, 500);
    });
  }
}

/* =====================
   RENDER
===================== */
function renderOrders(page = document.querySelector('[data-page="my-order"]')) {
  const main = page.querySelector('main');
  if (!main) return;
  main.innerHTML = '';

  if (!filteredOrders.length) {
    main.appendChild(
      createElement('div', { className: 'text-center py-10 text-slate-500' }, 'سفارشی یافت نشد')
    );
    return;
  }

  filteredOrders.forEach(order => {
    main.appendChild(createOrderElement(order));
  });
}

/* =====================
   ORDER CARD
===================== */
function createOrderElement(order) {
  let badge = '';
  let statusColorClass = '';
  let typeText = '';

  if (order.type === 'sender') {
    badge = `<span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">سپارا</span>`;
    statusColorClass = `text-amber-600`;
    typeText = 'سپارا';
  } else if (order.type === 'carrier' || order.type === 'traveler') {
    badge = `<span class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">رسانا</span>`;
    statusColorClass = `text-emerald-600`;
    typeText = 'رسانا';

    // Add price if available
    if (order.details?.price) {
      badge += `<span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 mr-2">${order.details.price}</span>`;
    }
  } else if (order.type === 'flight') {
    badge = `<span class="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">پرواز</span>`;
    statusColorClass = `text-emerald-600`;
    typeText = 'پرواز';

    if (order.price) badge += `<span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 mr-2">${order.price} OMR</span>`;
  }

  const date = new Date(order.dateISO);
  const formattedDate = date.toLocaleDateString('fa-IR');

  return createElement('div', {
    className: 'rounded-2xl p-4 bg-white dark:bg-surface-dark shadow-sm cursor-pointer hover:scale-[0.98] transition mb-4',
    'data-order-id': order.id,
    'data-order-type': order.type
  }, `
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="font-bold mb-2">${order.from} → ${order.to}</div>
        ${order.description ? `<div class="text-sm text-slate-600 dark:text-slate-300 mb-1">${order.description}</div>` : ''}
        <div class="text-xs text-slate-500 mb-1">${order.action}</div>
        <div class="flex items-center gap-2 mt-2">
          ${badge}
          <span class="text-xs font-medium ${statusColorClass}">${order.statusText}</span>
        </div>

        ${(order.type === 'carrier' || order.type === 'traveler') ? `
          <div class="text-xs mt-2">تاریخ پرواز: ${order.flightDate}</div>
          <div class="text-xs">ساعت پرواز: ${order.flightTime}</div>
          <div class="text-xs">ظرفیت مسافر: ${order.travelerCapacity}</div>
        ` : ''}
      </div>
      <div class="flex flex-col items-end gap-2">
        <div class="text-xs text-slate-400">${formattedDate}</div>
        ${order.details && order.details.category ? 
          `<span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">${getCategoryName(order.details.category)}</span>` : 
          ''
        }
      </div>
    </div>
  `);
}

/* =====================
   CLICK HANDLERS
===================== */
function initOrderClickHandlers(page) {
  delegateEvent(page, 'click', '[data-order-id]', e => {
    const orderEl = e.target.closest('[data-order-id]');
    const id = orderEl.dataset.orderId;
    const order = getAllOrders().find(o => o.id == id);
    if (order) {
      if (order.type === 'flight') showFlightDetailsModal(order);
      else showOrderDetailsModal(order);
    }
  });
}

/* =====================
   FLIGHT MODAL
===================== */
function showFlightDetailsModal(order) {
  const modal = createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
  }, `
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">جزئیات پرواز</h3>
        <button class="modal-close text-slate-400 hover:text-slate-600">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="space-y-4">
        <div class="flex justify-between"><span class="text-slate-600 dark:text-slate-300">مسیر:</span><span class="font-medium">${order.from} → ${order.to}</span></div>
        ${order.price ? `<div class="flex justify-between"><span class="text-slate-600 dark:text-slate-300">قیمت:</span><span class="font-bold text-primary">${order.price} OMR</span></div>` : ''}
        ${order.category ? `<div class="flex justify-between"><span class="text-slate-600 dark:text-slate-300">دسته‌بندی:</span><span class="font-medium">${getCategoryName(order.category)}</span></div>` : ''}
        ${order.description ? `<div class="flex justify-between"><span class="text-slate-600 dark:text-slate-300">توضیحات:</span><span class="font-medium">${order.description}</span></div>` : ''}
        ${(order.type === 'carrier' || order.type === 'traveler') ? `
          <div class="flex justify-between"><span class="text-slate-600 dark:text-slate-300">تاریخ پرواز:</span><span class="font-medium">${order.flightDate}</span></div>
          <div class="flex justify-between"><span class="text-slate-600 dark:text-slate-300">ساعت پرواز:</span><span class="font-medium">${order.flightTime}</span></div>
          <div class="flex justify-between"><span class="text-slate-600 dark:text-slate-300">ظرفیت مسافر:</span><span class="font-medium">${order.travelerCapacity}</span></div>
        ` : ''}
        <div class="flex justify-between"><span class="text-slate-600 dark:text-slate-300">وضعیت:</span><span class="font-medium text-emerald-600">${order.statusText}</span></div>
      </div>
      
      <div class="mt-8 flex gap-3">
        <button class="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors modal-close">بستن</button>
        <button class="flex-1 py-3 rounded-xl bg-primary hover:bg-blue-600 text-white font-medium transition-colors">افزودن به سفارش‌ها</button>
      </div>
    </div>
  `);

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  modal.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.remove();
      document.body.style.overflow = '';
    });
  });

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  });
}

/* =====================
   CATEGORY NAMES
===================== */
function getCategoryName(category) {
  const categories = {
    'docs': 'مدارک',
    'electronics': 'الکترونیک',
    'clothes': 'پوشاک',
    'valuables': 'اشیاء قیمتی'
  };
  return categories[category] || category;
}

/* =====================
   EXPORT
===================== */
export function refreshOrders() {
  applyFilter(currentFilter);
}
