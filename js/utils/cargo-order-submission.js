// utils/cargo-order-submission.js
import { addDynamicOrder } from './order-store.js';
import { showNotification } from './notifications.js';

export function initCargoOrderSubmission() {
  // Listen for clicks on any add-to-cargo button
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cargo-btn');
    if (!btn) return;

    e.preventDefault();
    const cargoId = btn.dataset.cargoId;
    if (!cargoId) {
      console.warn('⚠️ Cargo button clicked but no cargoId found');
      return;
    }

    console.log('🖱️ Cargo add button clicked', cargoId);

    // Find the parent cargo card
    const cargoCard = btn.closest('.group');
    if (!cargoCard) return;

    // Extract info safely relative to the card
    const from = cargoCard.querySelector('div.flex.flex-col.items-center span.text-xl')?.textContent || 'Unknown';
    const to = Array.from(cargoCard.querySelectorAll('div.flex.flex-col.items-center span.text-xl'))[1]?.textContent || 'Unknown';
    const date = cargoCard.querySelector('div.flex.items-center span.text-xs')?.textContent || '';
    const time = Array.from(cargoCard.querySelectorAll('div.flex.items-center span.text-xs'))[1]?.textContent || '';
    const route = `${from} → ${to}`;
    
    // Create order object
    const orderObj = {
      id: `cargo-${crypto.randomUUID()}`,
      type: 'cargo',
      dateISO: new Date().toISOString(),
      statusText: 'در انتظار تایید',
      statusColor: 'amber',
      from,
      to,
      action: 'افزودن به سفارش‌ها',
      description: `${route} • ${date} ${time}`,
      details: {
        date,
        time,
        route
      }
    };

    // Add to orders
    try {
      addDynamicOrder(orderObj);

      // Disable button & update UI
      btn.disabled = true;
      btn.classList.remove('bg-primary', 'hover:bg-blue-600');
      btn.classList.add('bg-emerald-500', 'hover:bg-emerald-600', 'text-white');
      btn.innerHTML = '<span class="material-symbols-outlined text-[14px]">check</span> ثبت شد';

      if (typeof showNotification !== 'undefined') {
        showNotification(`بار از ${from} → ${to} به سفارش‌ها اضافه شد`, 'success');
      }

      console.log('✅ Cargo order added', orderObj);
    } catch (err) {
      console.error('❌ Failed to add cargo order', err);
      // Revert button state on error
      btn.disabled = false;
      btn.classList.remove('bg-emerald-500', 'hover:bg-emerald-600', 'text-white');
      btn.classList.add('bg-primary', 'hover:bg-blue-600');
      btn.innerHTML = 'افزودن به سفارش';
    }
  });
}
