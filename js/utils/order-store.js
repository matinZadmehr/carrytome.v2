// utils/orders-store.js
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

console.log('✅ orders-store.js loaded successfully');
