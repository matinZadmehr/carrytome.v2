import { saveTrip, loadTrips, removeTrip } from '../utils/storage.js';
import { showNotification } from '../utils/notifications.js';
import { createElement } from '../utils/dom.js';

const FLIGHT_DATA = [
    {
        id: 1,
        fromCode: 'THR',
        toCode: 'DXB',
        route: 'تهران به دبی',
        date: '۱۲ مهر',
        cargo: 'لپ‌تاپ (۲ کیلوگرم)',
        cargoIcon: 'luggage',
        reward: '۲۱۰ OMR',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqSiD14mSgK581mmCO0OKFUTpe_BPNQtthBZ4-lQAGV6uRz9OrywkHhKVzYud7P0IFpQgHEpGVkole86ujgxA_267YWx1R2N7vDNoN0Ps6JUagUFAfIKAkMvkTTU2j9s_38HpDdd9dVigOzK0y3Kz1wt-g5gORWP3pIiW_raqiy5kW6BIN2MdMoFE5QyDPW3tMBEGavZpv1Mgs3VKufWJ2TTmC9_7nVCv7NfWFaxAlOZSGNW2ZGMvnXNlxLUVSM5BqPGEUORXQc2j5',
        alt: 'Modern skyline of Dubai with Burj Khalifa at sunset',
        verified: true,
        weight: 2,
        rewardValue: 210,
        dateValue: 12
    },
    {
        id: 2,
        fromCode: 'IST',
        toCode: 'LHR',
        route: 'تهران به مسقط',
        date: '۱۵ مهر',
        cargo: 'مدارک (۰.۵ کیلوگرم)',
        cargoIcon: 'description',
        reward: '۲۲۰ OMR',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMI5OKQPn80sRQnEV2iOQWozvmbcL7rbLbuePwEaQqRt-qc1r5Lc-c9asRG-Xz-9cLN17steF3gysrGaLZHPW71Jm847ln4USc5cP9r7JSM7yy4F1_9oFM2H_1yVycuVCi-RNtaqF7sQ2xriyDwi5Kvt_Qzz2aBaV6veTYgi_Z-zB3_s4-IoCZFeU3nqPD3_aRdquEchwoTbPNKLTA0wWdAGWtPL8D7RgqdZPFgpnivqIFBjc_mjxl4McLq8SnWAU_J7-5VzFyKdPx',
        alt: 'Iconic Big Ben and red bus in London street',
        verified: true,
        weight: 0.5,
        rewardValue: 220,
        dateValue: 15
    },
    {
        id: 3,
        fromCode: 'DXB',
        toCode: 'JFK',
        route: 'مسقط به تهران',
        date: '۱۸ مهر',
        cargo: 'ساعت (۰.۳ کیلوگرم)',
        cargoIcon: 'watch',
        reward: '۲۴۰ OMR',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgG5YGD_XXUt_RdarrXsU_kxzSVxrfzfr5xx0I8sW7q0_sW-v0bpfaWSHCRC3EN66ENqgde74TAk34ay2mXTlkQ2RXFFCQ2udirNFhlSmgO8SabeqnC9zmJMuYrizDrJqg3El9FXOpGziRw4mDBhC3zcXC_iL3w3TKZxZLjOszcTPpQ2dO_CwmK7QwWzQW2mFiHoQKobCkYEBYpC_aiP4XJHLNTd5OXF18OO4lO8Nr8md_FeMykdvATSoZJ1O59RG2i9m8pnKqbHlo',
        alt: 'New York City Manhattan skyline during daytime',
        verified: false,
        weight: 0.3,
        rewardValue: 240,
        dateValue: 18
    }
];

let filteredFlights = [...FLIGHT_DATA];
let currentFilter = 'all';

export function initRegisteredFlightFilters() {
    const page = document.querySelector('[data-page="registered-flight"]');
    if (!page) return;

    // Load submitted status
    const submittedTrips = loadTrips();
    FLIGHT_DATA.forEach(flight => {
        flight.submitted = submittedTrips.some(trip => trip.id === flight.id);
    });

    initFilters(page);
    renderFlights(page);
    initFlightActions(page);
}

function initFilters(page) {
    const buttons = Array.from(page.querySelectorAll('div.flex.gap-3.px-4.pb-4 button'));

    const setActive = (activeIndex) => {
        buttons.forEach((btn, idx) => {
            btn.classList.remove('bg-slate-900', 'dark:bg-white');
            if (idx === activeIndex) {
                btn.classList.add('bg-slate-900', 'dark:bg-white');
                const span = btn.querySelector('span');
                if (span) {
                    span.classList.add('text-white', 'dark:text-slate-900');
                    span.classList.remove('text-slate-600', 'dark:text-slate-300');
                }
            } else {
                btn.classList.remove('bg-slate-900', 'dark:bg-white');
                const span = btn.querySelector('span');
                if (span) {
                    span.classList.remove('text-white', 'dark:text-slate-900');
                    span.classList.add('text-slate-600', 'dark:text-slate-300');
                }
            }
        });
    };

    const applyFilter = (filterType) => {
        switch (filterType) {
            case 'همه':
                currentFilter = 'all';
                filteredFlights = [...FLIGHT_DATA];
                break;

            case 'بیشترین پاداش':
                currentFilter = 'highest-reward';
                filteredFlights = [...FLIGHT_DATA].sort((a, b) => b.rewardValue - a.rewardValue);
                break;

            case 'نزدیک‌ترین زمان':
                currentFilter = 'closest-date';
                filteredFlights = [...FLIGHT_DATA].sort((a, b) => a.dateValue - b.dateValue);
                break;

            case 'بارهای سبک':
                currentFilter = 'light-cargo';
                filteredFlights = FLIGHT_DATA.filter(flight => flight.weight <= 1);
                break;

            default:
                currentFilter = 'all';
                filteredFlights = [...FLIGHT_DATA];
        }

        renderFlights();
    };

    buttons.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            setActive(idx);
            const filterText = btn.textContent.trim();
            applyFilter(filterText);
        });
    });

    setActive(0);
}

function renderFlights(page = document.querySelector('[data-page="registered-flight"]')) {
    if (!page) return;

    const container = page.querySelector('.flex.flex-col.gap-4.px-4');
    if (!container) return;

    container.innerHTML = '';

    filteredFlights.forEach(flight => {
        const flightElement = createFlightElement(flight);
        container.appendChild(flightElement);
    });

    if (filteredFlights.length === 0) {
        const noResults = createElement('div', {
            className: 'text-center py-8'
        }, `
      <span class="material-symbols-outlined text-4xl text-slate-400 mb-4">flight</span>
      <p class="text-slate-500 dark:text-slate-400">هیچ فرصت تحویلی با این فیلتر یافت نشد.</p>
    `);
        container.appendChild(noResults);
    }
}

function createFlightElement(flight) {
    const addButtonClass = flight.submitted
        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
        : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';

    const addButtonIcon = flight.submitted ? 'check' : 'add';
    const addButtonText = flight.submitted ? 'ثبت شده' : 'افزودن';

    const element = createElement('div', {
        className: 'group relative flex flex-col gap-4 rounded-2xl bg-surface-light dark:bg-surface-dark p-4 shadow-soft hover:shadow-md transition-shadow duration-300 border border-transparent dark:border-slate-800',
        'data-flight-id': flight.id
    }, `
    <div class="absolute top-3 left-3 z-20">
      <button class="add-to-trip-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${addButtonClass} shadow-sm active:scale-95" 
              data-flight-id="${flight.id}" data-submitted="${flight.submitted}">
        <span class="material-symbols-outlined text-[14px]">${addButtonIcon}</span>
        ${addButtonText}
      </button>
    </div>
    
    <div class="flex items-start justify-between gap-4 pt-1">
      <div class="flex flex-[2] flex-col gap-3">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <h3 class="text-slate-900 dark:text-white text-base font-bold leading-tight font-display">
              ${flight.fromCode}
              <span class="text-slate-400 mx-1 text-xs">✈️</span>
              ${flight.toCode}
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
          <button class="flex w-full items-center justify-between rounded-xl h-10 px-4 bg-primary/10 hover:bg-primary/20 text-primary transition-colors" 
                  data-route="flight-order" type="button" data-flight-id="${flight.id}">
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
        ${flight.verified ? `
          <div class="absolute bottom-1 right-1 z-20">
            <span class="material-symbols-outlined text-white text-[14px]">verified_user</span>
          </div>
        ` : ''}
      </div>
    </div>
  `);

    return element;
}

function initFlightActions(page) {
    // Add/remove from trips
    page.addEventListener('click', (e) => {
        const addButton = e.target.closest('.add-to-trip-btn');
        if (addButton) {
            e.preventDefault();
            e.stopPropagation();
            const flightId = addButton.dataset.flightId;
            toggleFlightSubmission(flightId, addButton);
        }

        const viewButton = e.target.closest('button[data-route="flight-order"]');
        if (viewButton) {
            e.preventDefault();
            const flightId = viewButton.dataset.flightId;
            const flight = FLIGHT_DATA.find(f => f.id == flightId);
            if (flight && window.router) {
                window.router.navigate('flight-order');
            }
        }
    });
}

function toggleFlightSubmission(flightId, button) {
    const flight = FLIGHT_DATA.find(f => f.id == flightId);
    if (!flight) return;

    if (!flight.submitted) {
        // Submit flight to trips
        flight.submitted = true;
        button.dataset.submitted = "true";
        button.classList.remove('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-200', 'dark:border-slate-700', 'text-slate-700', 'dark:text-slate-300');
        button.classList.add('bg-emerald-500', 'hover:bg-emerald-600', 'text-white');
        button.innerHTML = '<span class="material-symbols-outlined text-[14px]">check</span> ثبت شده';

        const tripData = {
            id: flight.id,
            fromCode: flight.fromCode,
            toCode: flight.toCode,
            route: flight.route,
            date: flight.date,
            cargo: flight.cargo,
            cargoIcon: flight.cargoIcon,
            reward: flight.reward,
            image: flight.image,
            alt: flight.alt,
            verified: flight.verified,
            weight: flight.weight,
            submittedDate: new Date().toISOString(),
            status: 'submitted',
            submittedId: Date.now() + '-' + flight.id
        };

        saveTrip(tripData);
        showNotification(`سفر ${flight.fromCode} → ${flight.toCode} به سفرهای من اضافه شد`, 'success');
    } else {
        // Remove from submitted trips
        flight.submitted = false;
        button.dataset.submitted = "false";
        button.classList.remove('bg-emerald-500', 'hover:bg-emerald-600', 'text-white');
        button.classList.add('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-200', 'dark:border-slate-700', 'text-slate-700', 'dark:text-slate-300');
        button.innerHTML = '<span class="material-symbols-outlined text-[14px]">add</span> افزودن';

        removeTrip(flight.id);
        showNotification(`سفر ${flight.fromCode} → ${flight.toCode} از سفرهای من حذف شد`, 'error');
    }
}