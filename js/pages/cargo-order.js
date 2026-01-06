// cargo-order.js
import { loadTrips } from '../utils/storage.js';

/**
 * Initialize the cargo order page to populate data when requested
 */
export function initCargoOrderPage() {
    const page = document.querySelector('[data-page="cargo-order"]');
    if (!page) return;

    // Listen for custom event to show cargo details
    window.addEventListener('show-cargo-order', (e) => {
        const cargoId = e.detail?.cargoId;
        if (!cargoId) return;

        // Load all trips from localStorage
        const trips = loadTrips();
        const cargo = trips.find(c => c.id == cargoId || c.submittedId == cargoId);
        if (!cargo) return;

        populateCargoOrder(page, cargo);
    });
}

/**
 * Populate the cargo-order page with cargo info
 */
function populateCargoOrder(page, cargo) {
    // Main image
    const imageDiv = page.querySelector('.relative.h-48.w-full.bg-slate-100');
    if (imageDiv) {
        const bgDiv = imageDiv.querySelector('div[style]');
        if (bgDiv) {
            bgDiv.style.backgroundImage = `url('${cargo.image}')`;
            bgDiv.dataset.alt = cargo.name || '';
        }
    }

    // Cargo name & category
    const nameElem = page.querySelector('h2.text-xl.font-bold');
    if (nameElem) nameElem.textContent = cargo.name;

    const categoryElem = page.querySelector('div.absolute.top-3.right-3');
    if (categoryElem) categoryElem.textContent = cargo.category;

    // Weight
    const weightElem = page.querySelector('span[data-cargo-weight]');
    if (weightElem) weightElem.textContent = `${cargo.weight} kg`;

    // Reward
    const rewardElem = page.querySelector('div.bg-gradient-to-br h2.text-4xl');
    if (rewardElem) rewardElem.textContent = cargo.reward;

    // Description
    const descElem = page.querySelector('p.text-slate-500');
    if (descElem) descElem.textContent = `وزن ${cargo.weight} کیلوگرم - ${cargo.name}`;
}

/**
 * Trigger showing the cargo-order page
 * @param {number|string} cargoId 
 */
export function showCargoOrder(cargoId) {
    window.dispatchEvent(new CustomEvent('show-cargo-order', { detail: { cargoId } }));
}
