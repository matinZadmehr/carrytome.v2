import { delegateEvent, createElement } from '../utils/dom.js';
import { showOrderDetailsModal } from './modals.js';

const ORDER_DATA = [
  {
    id: 1,
    type: 'sender',
    status: 'waiting',
    statusText: 'در انتظار مسافر',
    statusColor: 'amber',
    icon: 'package_2',
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    iconText: 'text-primary',
    from: 'تهران (IKA)',
    to: 'مسقط (MCT)',
    action: 'سپردن مرسوله',
    date: '۱۴ شهریور',
    details: {
      item: 'آیفون ۱۳ پرو مکس',
      weight: '۵۰۰ گرم',
      price: '25.00 OMR',
      priceLabel: 'پیشنهاد شما'
    },
    showStats: true,
    showDetailsButton: false
  },
  {
    id: 2,
    type: 'carrier',
    status: 'confirmed',
    statusText: 'تایید شده',
    statusColor: 'emerald',
    icon: 'flight_takeoff',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    from: 'تهران (IKA)',
    to: 'مسقط (MCT)',
    action: 'حمل بار',
    date: '۲۰ شهریور',
    details: {
      capacity: '۲ کیلوگرم',
      status: 'در حال هماهنگی',
      price: '50.00 OMR',
      priceLabel: 'پاداش'
    },
    showStats: true,
    showDetailsButton: false
  },
  {
    id: 3,
    type: 'sender',
    status: 'delivered',
    statusText: 'تحویل شده',
    statusColor: 'slate',
    icon: 'check_circle',
    iconBg: 'bg-slate-100 dark:bg-slate-700',
    iconText: 'text-slate-500',
    from: 'تهران (IKA)',
    to: 'مسقط (MCT)',
    action: 'سپردن مرسوله',
    date: '۱ ماه پیش',
    details: {
      item: 'لپ‌تاپ گیمینگ ایسوس',
      detailsButton: true
    },
    showStats: false,
    showDetailsButton: true,
    opacity: 'opacity-80'
  },
  {
    id: 4,
    type: 'sender',
    status: 'paid',
    statusText: 'پرداخت شده',
    statusColor: 'blue',
    icon: 'package_2',
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    iconText: 'text-primary',
    from: 'تهران (IKA)',
    to: 'مسقط (MCT)',
    action: 'سپردن مرسوله',
    date: '۲۵ شهریور',
    details: {
      item: 'مدارک دانشگاهی',
      weight: '۲۰۰ گرم',
      price: '15.00 OMR',
      priceLabel: 'هزینه'
    },
    showStats: true,
    showDetailsButton: false
  }
];

let filteredOrders = [...ORDER_DATA];
let currentFilter = 'all';

export function initMyOrderPage() {
  const page = document.querySelector('[data-page="my-order"]');
  if (!page) return;

  initFilterRadios(page);
  initSearch(page);
  initOrderClickHandlers(page);
  renderOrders(page);
}

export function initMyOrderPage() {
  console.log('🚀 initMyOrderPage called');

  const page = document.querySelector('[data-page="my-order"]');
  if (!page) {
    console.error('❌ Page element not found!');
    return;
  }

  // نمایش صفحه
  page.classList.remove('hidden');
  page.style.display = 'flex';
  page.style.opacity = '1';
  page.setAttribute('aria-hidden', 'false');

  console.log('📄 Page element found:', {
    id: page.id,
    classes: page.className,
    hidden: page.classList.contains('hidden'),
    display: page.style.display
  });

  // پاک کردن محتوای static موجود
  const main = page.querySelector('main');
  if (main) {
    console.log('🧹 Clearing main content...');
    main.innerHTML = '';

    // اضافه کردن loader موقت
    const loader = document.createElement('div');
    loader.className = 'text-center py-12 text-slate-500 dark:text-slate-400';
    loader.innerHTML = `
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>در حال بارگذاری سفارش‌ها...</p>
        `;
    main.appendChild(loader);
  } else {
    console.error('❌ Main element not found in page');
    return;
  }

  // کمی تاخیر برای اطمینان از رندر شدن DOM
  setTimeout(() => {
    try {
      initFilterRadios(page);
      initSearch(page);
      initOrderClickHandlers(page);
      renderOrders(page);

      console.log('✅ My-order page initialized successfully');

      // نمایش پیام موفقیت
      if (main) {
        setTimeout(() => {
          const loader = main.querySelector('.text-center');
          if (loader) loader.remove();
        }, 300);
      }
    } catch (error) {
      console.error('❌ Error initializing page:', error);

      // نمایش پیام خطا
      if (main) {
        main.innerHTML = `
                    <div class="text-center py-12">
                        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <span class="material-symbols-outlined text-3xl text-red-500">error</span>
                        </div>
                        <h3 class="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">خطا در بارگذاری</h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400">${error.message}</p>
                        <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm">
                            تلاش مجدد
                        </button>
                    </div>
                `;
      }
    }
  }, 50); // تاخیر کوتاه
}

function updateActiveFilter(page, activeIndex) {
  const filterLabels = page.querySelectorAll('label[class*="peer"]');
  filterLabels.forEach((label, index) => {
    const div = label.querySelector('div');
    if (div) {
      if (index === activeIndex) {
        div.classList.add('bg-white', 'dark:bg-slate-600', 'text-primary', 'dark:text-white', 'shadow-sm');
        div.classList.remove('text-slate-500', 'dark:text-slate-400');
      } else {
        div.classList.remove('bg-white', 'dark:bg-slate-600', 'text-primary', 'dark:text-white', 'shadow-sm');
        div.classList.add('text-slate-500', 'dark:text-slate-400');
      }
    }
  });
}

function applyFilter(filterType) {
  currentFilter = filterType;

  switch (filterType) {
    case 'all':
      filteredOrders = [...ORDER_DATA];
      break;
    case 'sender':
      filteredOrders = ORDER_DATA.filter(order => order.type === 'sender');
      break;
    case 'carrier':
      filteredOrders = ORDER_DATA.filter(order => order.type === 'carrier');
      break;
    default:
      filteredOrders = [...ORDER_DATA];
  }

  renderOrders();
}

function renderOrders(page = document.querySelector('[data-page="my-order"]')) {
  if (!page) return;

  const container = page.querySelector('main');
  if (!container) return;

  const existingOrders = container.querySelectorAll('.rounded-2xl.bg-surface-light, .rounded-2xl.bg-surface-dark');
  existingOrders.forEach(order => order.remove());

  if (filteredOrders.length === 0) {
    const noOrders = createElement('div', {
      className: 'text-center py-12'
    }, `
      <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <span class="material-symbols-outlined text-3xl text-slate-400">package_2</span>
      </div>
      <h3 class="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">سفارشی یافت نشد</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400">هیچ سفارشی با این فیلتر وجود ندارد.</p>
    `);
    container.appendChild(noOrders);
    return;
  }

  filteredOrders.forEach(order => {
    const orderElement = createOrderElement(order);
    container.appendChild(orderElement);
  });
}

function createOrderElement(order) {
  let detailsHTML = '';
  if (order.showStats) {
    const detail1 = order.type === 'carrier'
      ? { label: 'ظرفیت', value: order.details.capacity }
      : { label: 'آیتم', value: order.details.item };

    const detail2 = order.type === 'carrier'
      ? { label: 'وضعیت', value: order.details.status, valueClass: `text-${order.statusColor}-600 dark:text-${order.statusColor}-400` }
      : { label: 'وزن', value: order.details.weight };

    detailsHTML = `
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-400">${detail1.label}</span>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-200">${detail1.value}</span>
        </div>
        <div class="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-400">${detail2.label}</span>
          <span class="text-sm font-medium ${detail2.valueClass || 'text-slate-700 dark:text-slate-200'}">${detail2.value}</span>
        </div>
        <div class="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
        <div class="flex flex-col gap-1 items-end">
          <span class="text-xs text-slate-400">${order.details.priceLabel}</span>
          <span class="text-sm font-bold text-slate-900 dark:text-white">${order.details.price}</span>
        </div>
      </div>
    `;
  } else if (order.showDetailsButton) {
    detailsHTML = `
      <div class="border-t border-slate-100 dark:border-slate-700 pt-3 flex items-center justify-between">
        <span class="text-sm text-slate-500">${order.details.item}</span>
        <button class="view-details-btn text-xs font-medium text-primary hover:underline flex items-center gap-1" data-order-id="${order.id}">
          مشاهده جزئیات
          <span class="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>
      </div>
    `;
  }

  const element = createElement('div', {
    className: `group bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-transparent ${order.opacity || ''} hover:border-primary/20 transition-all active:scale-[0.98]`,
    'data-order-id': order.id,
    'data-order-type': order.type,
    'data-order-status': order.status
  }, `
    <div class="flex justify-between items-start mb-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full ${order.iconBg} ${order.iconText} flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[20px]">${order.icon}</span>
        </div>
        <div>
          <div class="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <span>${order.from}</span>
            <span class="material-symbols-outlined text-xs text-slate-400 rotate-180" dir="ltr">arrow_right_alt</span>
            <span>${order.to}</span>
          </div>
          <span class="text-xs text-slate-500 dark:text-slate-400">${order.action} • ${order.date}</span>
        </div>
      </div>
      <div class="px-2.5 py-1 rounded-full bg-${order.statusColor}-50 dark:bg-${order.statusColor}-900/20 border border-${order.statusColor}-100 dark:border-${order.statusColor}-800/30">
        <p class="text-xs font-medium text-${order.statusColor}-600 dark:text-${order.statusColor}-400">${order.statusText}</p>
      </div>
    </div>
    ${detailsHTML}
  `);

  if (order.status === 'confirmed') {
    element.classList.add('hover:border-emerald-500/20');
  }

  return element;
}

function initSearch(page) {
  const searchButton = page.querySelector('header button:last-child');
  if (!searchButton) return;

  let searchInput = null;
  let isSearchActive = false;

  const createSearchInput = () => {
    const container = createElement('div', {
      className: 'absolute top-4 left-4 right-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-2 z-40'
    });

    const input = createElement('input', {
      type: 'text',
      placeholder: 'جست‌وجو در سفارش‌ها...',
      className: 'w-full h-10 px-4 pr-10 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary text-sm text-slate-900 dark:text-white'
    });

    const closeButton = createElement('button', {
      className: 'absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
    }, '<span class="material-symbols-outlined text-[20px]">close</span>');

    container.appendChild(input);
    container.appendChild(closeButton);

    return { container, input, closeButton };
  };

  searchButton.addEventListener('click', () => {
    if (!isSearchActive) {
      const search = createSearchInput();
      searchInput = search.input;

      const header = page.querySelector('header');
      header.appendChild(search.container);

      setTimeout(() => searchInput.focus(), 100);

      search.closeButton.addEventListener('click', () => {
        search.container.remove();
        isSearchActive = false;
      });

      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        performSearch(query);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          search.container.remove();
          isSearchActive = false;
        }
      });

      isSearchActive = true;
    }
  });
}

function performSearch(query) {
  if (!query) {
    applyFilter(currentFilter);
    return;
  }

  const searchResults = ORDER_DATA.filter(order => {
    const searchableText = `
      ${order.from} ${order.to} ${order.action} ${order.date}
      ${order.details.item || ''} ${order.details.capacity || ''}
      ${order.details.weight || ''} ${order.statusText}
      ${order.type === 'sender' ? 'سپارا فرستنده' : 'رسانا مسافر'}
    `.toLowerCase();

    return searchableText.includes(query);
  });

  const page = document.querySelector('[data-page="my-order"]');
  if (!page) return;

  const container = page.querySelector('main');
  if (!container) return;

  const existingOrders = container.querySelectorAll('.rounded-2xl.bg-surface-light, .rounded-2xl.bg-surface-dark');
  existingOrders.forEach(order => order.remove());

  if (searchResults.length === 0) {
    const noResults = createElement('div', {
      className: 'text-center py-12'
    }, `
      <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <span class="material-symbols-outlined text-3xl text-slate-400">search_off</span>
      </div>
      <h3 class="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">نتیجه‌ای یافت نشد</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400">هیچ سفارشی با عبارت "${query}" وجود ندارد.</p>
    `);
    container.appendChild(noResults);
    return;
  }

  searchResults.forEach(order => {
    const orderElement = createOrderElement(order);
    container.appendChild(orderElement);
  });
}

function initOrderClickHandlers(page) {
  delegateEvent(page, 'click', '.rounded-2xl.bg-surface-light, .rounded-2xl.bg-surface-dark', (e) => {
    const orderCard = e.target.closest('.rounded-2xl.bg-surface-light, .rounded-2xl.bg-surface-dark');
    if (!orderCard) return;

    const orderId = orderCard.dataset.orderId;
    const order = ORDER_DATA.find(o => o.id == orderId);

    if (order) {
      if (window.router) {
        window.router.navigate('order-details');
      } else {
        showOrderDetailsModal(order);
      }
    }
  });

  delegateEvent(page, 'click', '.view-details-btn', (e) => {
    e.stopPropagation();
    const orderId = e.target.closest('.view-details-btn').dataset.orderId;
    const order = ORDER_DATA.find(o => o.id == orderId);

    if (order) {
      showOrderDetailsModal(order);
    }
  });
}