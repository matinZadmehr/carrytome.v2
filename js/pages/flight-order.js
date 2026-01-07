// flight-order.js
import { loadTrips } from '../utils/storage.js';
import { getOrders } from '../components/cart.js';

function extractAirportCode(text) {
    if (typeof text !== 'string') return '';
    const paren = text.match(/\(([A-Z]{3})\)/);
    if (paren) return paren[1];
    const any = text.match(/\b[A-Z]{3}\b/);
    return any ? any[0] : '';
}

function parseNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    const match = value.replace(/,/g, '').match(/[\d.]+/);
    return match ? Number(match[0]) || 0 : 0;
}

/**
 * Initialize the flight order page to populate data when requested
 */
export function initFlightOrderPage() {
    const page = document.querySelector('[data-page="flight-order"]');
    if (!page) return;

    // Listen for custom event to show flight details
    window.addEventListener('show-flight-order', (e) => {
        const flightId = e.detail?.flightId;
        if (!flightId) return;

        // Load all trips from localStorage
        const trips = loadTrips();
        let flight = trips.find(f => f.id == flightId || f.submittedId == flightId);

        // Fallback: if this id refers to an order request, render from cart orders
        if (!flight) {
            const orders = getOrders();
            const order = orders.find(o => o.id == flightId);
            if (order) {
                const fromCode = extractAirportCode(order.from) || order.from;
                const toCode = extractAirportCode(order.to) || order.to;
                const weight = parseNumber(order.details?.weight || '');
                const rewardValue = parseNumber(order.details?.value || order.details?.price || '');
                flight = {
                    id: order.id,
                    image: 'asset/images/logo.jpg',
                    fromCode,
                    toCode,
                    date: order.date || order.details?.date || '',
                    cargoIcon: 'inventory_2',
                    cargo: order.details?.item || order.item || order.description || 'مرسوله',
                    weight: weight || 0,
                    rewardValue: rewardValue || 0,
                };
            }
        }

        if (!flight) return;

        populateFlightOrder(page, flight);
    });
}

/**
 * Populate the flight-order page with the flight info
 */
function populateFlightOrder(page, flight) {
    // Main image
    const imageDiv = page.querySelector('.relative.h-48.w-full.bg-slate-100');
    if (imageDiv) {
        const bgDiv = imageDiv.querySelector('div[style]');
        if (bgDiv) {
            bgDiv.style.backgroundImage = `url('${flight.image}')`;
            bgDiv.dataset.alt = flight.alt || '';
        }
    }

    // Route & times
    const routeElems = page.querySelectorAll('div.relative.flex.flex-col.pt-1');
    if (routeElems.length >= 2) {
        // origin
        {
            const originBase = routeElems[0].querySelector('span.text-base');
            if (originBase) originBase.textContent = `${flight.fromCode} (${flight.fromCode})`;
            const originTime = routeElems[0].querySelector('span.text-sm');
            if (originTime) originTime.textContent = `${flight.date} - ساعت ${flight.timeFrom || '10:30'}`;
        }
        // destination
        {
            const destBase = routeElems[1].querySelector('span.text-base');
            if (destBase) destBase.textContent = `${flight.toCode} (${flight.toCode})`;
            const destTime = routeElems[1].querySelector('span.text-sm');
            if (destTime) destTime.textContent = `${flight.date} - ساعت ${flight.timeTo || '14:15'}`;
        }
    }

    // Cargo & weight
    const cargoContainer = page.querySelector('div.flex.flex-wrap.gap-2');
    if (cargoContainer) {
        cargoContainer.innerHTML = `
        <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/60 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
            <span class="material-symbols-outlined text-slate-700 dark:text-slate-300 text-[18px]">${flight.cargoIcon}</span>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">${flight.cargo}</span>
        </div>
        <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/60 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
            <span class="material-symbols-outlined text-slate-700 dark:text-slate-300 text-[18px]">scale</span>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">${flight.weight} kg</span>
        </div>
        `;
    }

    // Reward section
    const rewardElem = page.querySelector('div.bg-gradient-to-br h2.text-4xl');
    if (rewardElem) rewardElem.textContent = flight.rewardValue;

    // Category label
    const categoryLabel = page.querySelector('div.absolute.top-3.right-3');
    if (categoryLabel) categoryLabel.textContent = extractCategoryFromCargo(flight.cargo);

    // Flight title & description
    const titleElem = page.querySelector('h2.text-xl.font-bold');
    if (titleElem) titleElem.textContent = flight.route;
    const descElem = page.querySelector('p.text-slate-500');
    if (descElem) descElem.textContent = `${flight.cargo} - وزن ${flight.weight} کیلوگرم`;
}

/**
 * Trigger showing the flight-order page
 * @param {number|string} flightId 
 */
export function showFlightOrder(flightId) {
    window.dispatchEvent(new CustomEvent('show-flight-order', { detail: { flightId } }));
}

/**
 * Helper: extract category from cargo string (same as your existing function)
 */
function extractCategoryFromCargo(cargo) {
    if (cargo.toLowerCase().includes('لپ')) return 'الکترونیک';
    if (cargo.toLowerCase().includes('مدارک')) return 'مدارک';
    if (cargo.toLowerCase().includes('ساعت')) return 'ساعت';
    return 'سایر';
}
