import { loadTrips, saveTrip, removeTrip } from '../utils/storage.js';
import { showNotification } from '../utils/notifications.js';
import { createElement } from '../utils/dom.js';

export function initMyTripsPage() {
    const page = document.querySelector('[data-page="my-trips"]');
    if (!page) return;

    initTabSwitching(page);
    initTripActions(page);
    renderSubmittedTrips(page);
}

function initTabSwitching(page) {
    const radioInputs = page.querySelectorAll('input[name="trip_status"]');
    const activeTripsSection = page.querySelector('#active-trips');
    const submittedTripsSection = page.querySelector('#submitted-trips');

    const showSection = (sectionToShow) => {
        if (sectionToShow === 'active-trips') {
            if (activeTripsSection) activeTripsSection.classList.remove('hidden');
            if (submittedTripsSection) submittedTripsSection.classList.add('hidden');
        } else if (sectionToShow === 'submitted-trips') {
            if (activeTripsSection) activeTripsSection.classList.add('hidden');
            if (submittedTripsSection) submittedTripsSection.classList.remove('hidden');
            renderSubmittedTrips(page);
        }
    };

    const activeRadio = page.querySelector('input[name="trip_status"][value="current"]');
    if (activeRadio && activeRadio.checked) {
        showSection('active-trips');
    }

    radioInputs.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'submitted') {
                showSection('submitted-trips');
            } else if (e.target.value === 'current') {
                showSection('active-trips');
            }
        });
    });
}

function renderSubmittedTrips(page) {
    const container = page.querySelector('#submitted-trips');
    if (!container) return;

    const existingCards = container.querySelectorAll('.submitted-trip-card');
    existingCards.forEach(card => card.remove());

    const submittedTrips = loadTrips();

    if (submittedTrips.length === 0) {
        const emptyState = createElement('div', {
            className: 'text-center py-12'
        }, `
      <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <span class="material-symbols-outlined text-3xl text-slate-400">flight_takeoff</span>
      </div>
      <h3 class="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">هیچ سفری ثبت نکرده‌اید</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">با کلیک روی + در فرصت‌های تحویل، سفرهای خود را ثبت کنید</p>
      <button class="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-600 transition-colors" data-route="registered-flight">
        مشاهده فرصت‌ها
      </button>
    `);
        container.appendChild(emptyState);
        return;
    }

    submittedTrips.forEach(trip => {
        const tripCard = createSubmittedTripCard(trip);
        container.appendChild(tripCard);
    });
}

function createSubmittedTripCard(trip) {
    const submittedDate = new Date(trip.submittedDate);
    const formattedDate = submittedDate.toLocaleDateString('fa-IR');

    const element = createElement('div', {
        className: 'submitted-trip-card flex flex-col gap-4 rounded-xl bg-surface-light dark:bg-surface-dark p-4 shadow-sm border border-slate-100 dark:border-slate-800',
        'data-trip-id': trip.id,
        'data-submitted-id': trip.submittedId
    }, `
    <div class="flex items-start justify-between">
      <div class="flex flex-col gap-1">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
          <span>${trip.fromCode}</span>
          <span class="material-symbols-outlined text-slate-400 text-[18px] rotate-180">arrow_right_alt</span>
          <span>${trip.toCode}</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">درخواست ثبت شده: ${formattedDate}</p>
      </div>
      <div class="flex flex-col items-end">
        <span class="text-xs font-medium text-slate-500 dark:text-slate-400">${trip.date}</span>
        <span class="text-xs text-slate-400 dark:text-slate-500 font-display">--:--</span>
      </div>
    </div>

    <div class="h-px w-full bg-slate-100 dark:bg-slate-700/50"></div>

    <div class="flex gap-4 items-center">
      <div class="size-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
        <div class="w-full h-full bg-cover bg-center" style="background-image: url('${trip.image}')"></div>
      </div>
      <div class="flex flex-col flex-1 gap-1">
        <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">${trip.cargo.split('(')[0].trim()}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">${getCargoCategory(trip.cargo)} • ${trip.weight} کیلوگرم</p>
        <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">پاداش: ${trip.reward}</p>
      </div>
    </div>

    <div class="flex gap-2 mt-2">
      <button data-action="activate" data-trip-id="${trip.id}" data-submitted-id="${trip.submittedId}"
        class="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">
        فعال سازی
      </button>
      <button data-action="remove" data-trip-id="${trip.id}" data-submitted-id="${trip.submittedId}"
        class="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
        حذف
      </button>
    </div>
  `);

    return element;
}

function getCargoCategory(cargo) {
    if (cargo.includes('لپ‌تاپ') || cargo.includes('مک‌بوک') || cargo.includes('آیفون')) {
        return 'الکترونیکی';
    } else if (cargo.includes('مدارک') || cargo.includes('اسناد')) {
        return 'مدارک';
    } else if (cargo.includes('ساعت')) {
        return 'اکسسوری';
    } else if (cargo.includes('دارو')) {
        return 'دارویی';
    }
    return 'سایر';
}

function initTripActions(page) {
    page.addEventListener('click', (e) => {
        const actionButton = e.target.closest('[data-action]');
        if (!actionButton) return;

        e.preventDefault();
        e.stopPropagation();

        const action = actionButton.dataset.action;
        const tripId = actionButton.dataset.tripId;
        const submittedId = actionButton.dataset.submittedId;

        handleTripAction(action, tripId, submittedId, page);
    });
}

function handleTripAction(action, tripId, submittedId, page) {
    const trips = loadTrips();
    const tripIndex = trips.findIndex(t => t.submittedId === submittedId);

    if (tripIndex === -1) return;

    switch (action) {
        case 'activate':
            const activatedTrip = trips[tripIndex];
            activatedTrip.status = 'active';
            activatedTrip.activatedDate = new Date().toISOString();

            trips.splice(tripIndex, 1);
            saveTrip(activatedTrip);

            showNotification('سفر فعال شد و به بخش "فعال" منتقل شد', 'success');
            renderSubmittedTrips(page);
            break;

        case 'remove':
            if (confirm('آیا مطمئن هستید که می‌خواهید این سفر ثبت شده را حذف کنید؟')) {
                trips.splice(tripIndex, 1);
                saveTrip(trips);

                showNotification('سفر ثبت شده حذف شد', 'error');
                renderSubmittedTrips(page);
            }
            break;
    }
}

// My-trips specific functions
export function confirmOrder(orderId) {
    alert("پذیرفتن درخواست");
    console.log(`Confirming order: ${orderId}`);
}

export function negotiateOrder(orderId) {
    alert("چانه زنی با فرستنده بسته");
    console.log(`Negotiating order: ${orderId}`);
}