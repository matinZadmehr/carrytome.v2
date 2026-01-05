import { delegateEvent, createElement } from '../utils/dom.js';
import { showOrderDetailsModal } from './modals.js';
import { getDynamicOrders } from '../utils/order-store.js';

/* =====================
   STATIC ORDERS
===================== */
const STATIC_ORDERS = [
  {
    id: 1,
    type: 'sender',
    dateISO: '2024-09-05',
    statusText: 'در انتظار مسافر',
    statusColor: 'amber',
    from: 'تهران (IKA)',
    to: 'مسقط (MCT)',
    action: 'سپردن مرسوله',
    details: { item: 'آیفون ۱۳ پرو مکس' }
  },
  {
    id: 2,
    type: 'carrier',
    dateISO: '2024-09-10',
    statusText: 'تایید شده',
    statusColor: 'emerald',
    from: 'تهران (IKA)',
    to: 'مسقط (MCT)',
    action: 'حمل بار',
    details: { capacity: '۲ کیلوگرم' }
  }
];

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
  const dynamic = getDynamicOrders();
  console.log('Dynamic orders from store:', dynamic);
  console.log('All orders:', [...dynamic, ...STATIC_ORDERS]);
  return [...dynamic, ...STATIC_ORDERS];
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
  
  // Listen for orders updates from other parts of the app
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
    applyFilter(btn.dataset.filter);
    updateTabs(page, btn.dataset.filter);
  });
}

function applyFilter(filter) {
  currentFilter = filter;
  
  let orders = getAllOrders();
  if (filter !== 'all') {
    orders = orders.filter(o => o.type === filter);
  }
  
  // Apply search if exists
  if (searchQuery) {
    orders = orders.filter(o =>
      `${o.from} ${o.to} ${o.action} ${o.type === 'sender' ? 'سپارا' : 'رسانا'}`
        .toLowerCase()
        .includes(searchQuery)
    );
  }
  
  filteredOrders = sortOrders(orders);
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
  // You'll need to add this button to your HTML
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
  console.log('🎨 renderOrders called');
  console.log('Filtered orders:', filteredOrders);
  
  if (!page) {
    console.error('❌ Page not found');
    return;
  }
  
  const main = page.querySelector('main');
  if (!main) {
    console.error('❌ Main element not found');
    return;
  }

  main.innerHTML = '';

  if (!filteredOrders.length) {
    console.log('📭 No orders to display');
    main.appendChild(
      createElement('div', { className: 'text-center py-10 text-slate-500' },
        'سفارشی یافت نشد'
      )
    );
    return;
  }

  console.log(`🖼️ Rendering ${filteredOrders.length} orders`);
  filteredOrders.forEach(order => {
    console.log('📦 Rendering order:', order.id, order.from, '→', order.to);
    main.appendChild(createOrderElement(order));
  });
}

/* =====================
   ORDER CARD
===================== */
function createOrderElement(order) {
  const badge = order.type === 'sender'
    ? `<span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">سپارا</span>`
    : `<span class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">رسانا</span>`;

  const statusColorClass = `text-${order.statusColor}-600`;
  
  return createElement('div', {
    className: 'rounded-2xl p-4 bg-white dark:bg-surface-dark shadow-sm cursor-pointer hover:scale-[0.98] transition',
    'data-order-id': order.id
  }, `
    <div class="flex justify-between items-start">
      <div>
        <div class="font-bold">${order.from} → ${order.to}</div>
        <div class="text-xs text-slate-500 mt-1">${order.action}</div>
        <div class="text-xs text-slate-400 mt-1">${order.dateISO}</div>
      </div>
      <div class="flex flex-col items-end gap-2">
        ${badge}
        <span class="text-xs font-medium ${statusColorClass}">${order.statusText}</span>
      </div>
    </div>
  `);
}

/* =====================
   CLICK HANDLERS
===================== */
function initOrderClickHandlers(page) {
  delegateEvent(page, 'click', '[data-order-id]', e => {
    const id = e.target.closest('[data-order-id]').dataset.orderId;
    const order = getAllOrders().find(o => o.id == id);
    if (order) showOrderDetailsModal(order);
  });
}

// Export refresh function for other parts of app to call
export function refreshOrders() {
  applyFilter(currentFilter);
}