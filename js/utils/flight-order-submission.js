// flight-order-submission.js
//import { addOrder } from '../components/cart.js';
import { showNotification } from './notifications.js';
import { addDynamicOrder } from './order-store.js';

export function initFlightOrderSubmission() {
  // Attach a single click listener to the document
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-trip-btn');
    if (!btn) return; // Ignore clicks outside the buttons

    e.preventDefault();

    const flightId = btn.dataset.flightId;
    if (!flightId) {
      console.warn('⚠️ Flight button clicked but no flightId found');
      return;
    }

    console.log('🖱️ Flight add button clicked', flightId);

    // Get the parent element of the button (assumes siblings have h3, p, reward span)
    const flightEl = btn.closest('.group'); // instead of btn.parentElement

    const flight = {
      id: flightId,
      from: flightEl.querySelector('h3')?.textContent.split('✈️')[0].trim() || 'Unknown',
      to: flightEl.querySelector('h3')?.textContent.split('✈️')[1]?.trim() || 'Unknown',
      route: flightEl.querySelector('p')?.textContent || '',
      reward: flightEl.querySelector('.text-primary')?.textContent || '',
      rewardValue: parseInt(flightEl.querySelector('.text-primary')?.textContent) || 0,
      submitted: false
    };

    // Disable button and update UI
    btn.disabled = true;
    btn.classList.remove('bg-primary', 'hover:bg-blue-600');
    btn.classList.add('bg-emerald-500', 'hover:bg-emerald-600', 'text-white');
    btn.innerHTML = '<span class="material-symbols-outlined text-[14px]">check</span> ثبت شد';

    // Generate UUID for the order
    const uuid = crypto.randomUUID();
    flight.orderId = uuid;

    // Create order object
    const orderObj = {
      id: `flight-${uuid}`,
      type: 'flight',
      dateISO: new Date().toISOString(),
      statusText: 'در دسترس',
      statusColor: 'emerald',
      from: flight.from,
      to: flight.to,
      action: 'افزودن به سفارش‌ها',
      description: flight.route,
      price: flight.rewardValue,
      details: { reward: flight.reward, description: flight.route }
    };

    // Add to cart
    try {
      if (typeof addOrder !== 'undefined') addOrder(orderObj);
      if (typeof addDynamicOrder !== 'undefined') addDynamicOrder(orderObj);

      if (typeof showNotification !== 'undefined') {
        showNotification(`سفر ${flight.from} → ${flight.to} به سفرهای من اضافه شد`, 'success');
      }

      console.log('✅ Flight order added', orderObj);
    } catch (err) {
      console.error('❌ Failed to add flight order', err);
      // Revert button state on error
      btn.disabled = false;
      btn.classList.remove('bg-emerald-500', 'hover:bg-emerald-600', 'text-white');
      btn.classList.add('bg-primary', 'hover:bg-blue-600');
      btn.innerHTML = 'افزودن به سفارش‌ها';
    }
  });
}
