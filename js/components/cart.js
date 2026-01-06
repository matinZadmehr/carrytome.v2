// components/cart.js - Keep this separate
const CART_KEY = 'my_orders';

/* Get all orders */
export function getOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    console.log('📄 Retrieved orders from localStorage:', orders.length);
    return orders;
  } catch (error) {
    console.error('❌ Error reading orders from localStorage:', error);
    return [];
  }
}

/* Save orders to localStorage */
function saveOrders(orders) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(orders));
    console.log('💾 Saved orders to localStorage:', orders.length);
  } catch (error) {
    console.error('❌ Error saving orders to localStorage:', error);
  }
}

/* Add new order */

export function addOrder(order) {
  const orders = getOrders();
  
  // Generate unique ID if not exists
  const orderWithId = {
    ...order,
    id: order.id || Date.now(),
    createdAt: new Date().toISOString()
  };

  // Optional: prevent duplicates (same flight + date)
  const exists = orders.some(
    o => o.from === order.from &&
         o.to === order.to &&
         o.date === order.date
  );

  if (!exists) {
    orders.push(orderWithId);
    saveOrders(orders);
    
    // Notify other components
    window.dispatchEvent(new CustomEvent('cart-updated'));
    window.dispatchEvent(new CustomEvent('orders-updated'));
    
    console.log('✅ Order added:', orderWithId);
    return orderWithId;
  } else {
    console.log('⚠️ Order already exists, skipping');
    return null;
  }
}


/* Remove order by ID */
export function removeOrder(orderId) {
  const orders = getOrders();
  const filteredOrders = orders.filter(order => order.id !== orderId);
  
  if (filteredOrders.length < orders.length) {
    saveOrders(filteredOrders);
    window.dispatchEvent(new CustomEvent('cart-updated'));
    window.dispatchEvent(new CustomEvent('orders-updated'));
    console.log('🗑️ Order removed:', orderId);
    return true;
  }
  
  return false;
}

/* Update order */
export function updateOrder(orderId, updates) {
  const orders = getOrders();
  const index = orders.findIndex(order => order.id === orderId);
  
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates };
    saveOrders(orders);
    window.dispatchEvent(new CustomEvent('cart-updated'));
    window.dispatchEvent(new CustomEvent('orders-updated'));
    console.log('✏️ Order updated:', orderId);
    return true;
  }
  
  return false;
}

/* Clear all orders */
export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new CustomEvent('cart-updated'));
  window.dispatchEvent(new CustomEvent('orders-updated'));
  console.log('🧹 Cart cleared');
}