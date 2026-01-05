// utils/orders-store.js - FIXED VERSION
import { getOrders, addOrder as addCartOrder } from '../components/cart.js';

console.log('📦 orders-store.js loading...');

// Convert cart order format to my-order page format
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

// Get all dynamic orders (from cart)
export function getDynamicOrders() {
  try {
    const cartOrders = getOrders(); // Using imported function
    console.log(`📄 Got ${cartOrders.length} orders from cart`);
    
    return cartOrders.map(order => mapCartOrderToDisplayOrder(order));
  } catch (error) {
    console.error('❌ Error getting dynamic orders:', error);
    return [];
  }
}

// Add a new order to cart
export function addDynamicOrder(order) {
  try {
    console.log('➕ Adding dynamic order:', order);
    
    // Map to cart format
    const cartOrder = {
      from: order.from,
      to: order.to,
      date: order.dateISO || new Date().toISOString().split('T')[0],
      type: order.type || 'sender',
      status: order.statusText || 'در انتظار تایید',
      statusColor: order.statusColor || 'amber',
      item: order.details?.item || 'مرسوله',
      details: order.details || {},
      id: order.id || Date.now()
    };
    
    // Use imported addCartOrder function
    const addedOrder = addCartOrder(cartOrder);
    console.log('✅ Order added via cart.js');
    
    return addedOrder;
  } catch (error) {
    console.error('❌ Error adding dynamic order:', error);
    throw error;
  }
}

// Initialize the store
export function initializeOrdersStore() {
  console.log('📦 Initializing orders store...');
  try {
    const orders = getOrders(); // Using imported function
    console.log(`📊 Found ${orders.length} existing orders`);
    return orders;
  } catch (error) {
    console.error('❌ Error initializing orders store:', error);
    return [];
  }
}

// Get order by ID
export function getOrderById(orderId) {
  const orders = getOrders(); // Using imported function
  return orders.find(order => order.id == orderId);
}

console.log('✅ orders-store.js loaded successfully');