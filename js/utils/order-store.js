// utils/order-store.js
import { getOrders, addOrder as addCartOrder } from '../components/cart.js';

console.log('📦 orders-store.js loading...');

// Convert a cart order to the format used in My Orders page
function mapCartOrderToDisplayOrder(cartOrder) {
  return {
    id: cartOrder.id || Date.now(),
    type: cartOrder.type || 'sender',
    dateISO: cartOrder.date || new Date().toISOString().split('T')[0],
    statusText: cartOrder.status || 'در انتظار تایید',
    statusColor: cartOrder.statusColor || 'amber',
    from: cartOrder.from || 'تهران (IKA)',
    to: cartOrder.to || 'دبی (DXB)',
    action: cartOrder.type === 'carrier' ? 'حمل بار' : 'سپردن مرسوله',
    details: {
      item: cartOrder.item || 'مرسوله',
      ...(cartOrder.details || {})
    }
  };
}

// Get all orders from cart/localStorage
export function getDynamicOrders() {
  try {
    const cartOrders = getOrders(); // Always from real storage
    console.log(`📄 Got ${cartOrders.length} orders from cart`);
    return cartOrders.map(mapCartOrderToDisplayOrder);
  } catch (error) {
    console.error('❌ Error getting dynamic orders:', error);
    return [];
  }
}

// Add a new order to cart/localStorage
export function addDynamicOrder(order) {
  try {
    console.log('➕ Adding dynamic order:', order);

    const cartOrder = {
      id: order.id || Date.now(),
      type: order.type || 'sender',
      from: order.from,
      to: order.to,
      date: order.dateISO || new Date().toISOString().split('T')[0],
      status: order.statusText || 'در انتظار تایید',
      statusColor: order.statusColor || 'amber',
      item: order.details?.item || 'مرسوله',
      details: order.details || {}
    };

    const addedOrder = addCartOrder(cartOrder);
    console.log('✅ Order added via cart.js');

    return addedOrder;
  } catch (error) {
    console.error('❌ Error adding dynamic order:', error);
    throw error;
  }
}

// Initialize orders store: only load real orders from storage
export function initializeOrdersStore() {
  console.log('📦 Initializing orders store...');
  try {
    const orders = getOrders(); // Only real orders
    console.log(`📊 Found ${orders.length} existing orders`);
    return orders;
  } catch (error) {
    console.error('❌ Error initializing orders store:', error);
    return [];
  }
}

// Get a specific order by ID
export function getOrderById(orderId) {
  const orders = getOrders(); // Only from real storage
  return orders.find(order => order.id == orderId);
}

// --- Helper: Add cargo from page directly ---
export function addCargoFromCard(cardElement) {
  if (!cardElement) return;

  try {
    // Extract 'from' and 'to' from card spans
    const locations = cardElement.querySelectorAll('div.flex.flex-col.items-center span.text-xl');
    const from = locations[0]?.textContent || 'تهران (IKA)';
    const to = locations[1]?.textContent || 'استانبول (IST)';

    // Extract date (first date span in card)
    const date = cardElement.querySelector('div.flex.items-center.gap-1.5 span.text-xs')?.textContent
      || new Date().toISOString().split('T')[0];

    // Extract item/flight/cargo name
    const item = cardElement.querySelector('h2.text-xl')?.textContent
      || cardElement.querySelector('div.relative.flex.flex-col.pt-1 span.text-base')?.textContent
      || 'مرسوله';

    const order = {
      id: Date.now(),
      type: 'cargo',
      from,
      to,
      dateISO: new Date().toISOString().split('T')[0],
      statusText: 'در انتظار تایید',
      details: { item }
    };

    return addDynamicOrder(order);

  } catch (err) {
    console.error('❌ Failed to add cargo from card:', err);
    throw err;
  }
}

console.log('✅ orders-store.js loaded successfully');
