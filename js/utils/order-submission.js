// utils/order-submission.js - Safe version
import { addOrder } from '../components/cart.js';
import { showNotification } from './notifications.js';

let isInitialized = false;

// Safe initialization
export function initOrderSubmission() {
  console.log('📝 initOrderSubmission called');
  
  if (isInitialized) {
    console.log('⚠️ Already initialized, skipping');
    return;
  }

  if (document.readyState === 'loading') {
    console.log('⏳ DOM still loading, waiting...');
    document.addEventListener('DOMContentLoaded', initializeHandler);
  } else {
    console.log('⚡ DOM ready, initializing now');
    initializeHandler();
  }
}

function initializeHandler() {
  console.log('🔧 initializeHandler running...');
  
  const submitBtn = document.getElementById('submit-order');
  console.log('🔍 Submit button found:', !!submitBtn);
  
  if (submitBtn) {
    console.log('✅ Setting up order submission handler');
    
    // Remove existing event listeners by cloning
    const newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);
    
    // Add click handler
    newBtn.addEventListener('click', handleSubmitOrder);
    
    // Also handle form submissions
    const forms = document.querySelectorAll('form');
    console.log('📋 Forms found:', forms.length);
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        const btn = form.querySelector('#submit-order');
        if (btn) {
          e.preventDefault();
          handleSubmitOrder(new Event('click'));
        }
      });
    });
    
    isInitialized = true;
    console.log('🎯 Order submission initialized successfully');
  } else {
    console.log('⚠️ No submit-order button found on current page');
    
    // Try again when page changes
    document.addEventListener('route-change', () => {
      console.log('🔄 Route changed, checking for submit button again...');
      setTimeout(initializeHandler, 100);
    });
  }
}

// Handle order submission
async function handleSubmitOrder(event) {
  event.preventDefault();
  event.stopPropagation();
  
  console.log('🖱️ Submit order button clicked!');
  
  try {
    // Show loading state
    const submitBtn = document.getElementById('submit-order');
    const originalText = submitBtn?.textContent || 'افزودن به سفارش ها';
    
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'در حال ثبت...';
      submitBtn.classList.add('opacity-50');
    }
    
    // 1. Collect data
    const formData = collectFormData();
    console.log('📋 Collected form data:', formData);
    
    // 2. Validate
    if (!formData.from || !formData.to) {
      showNotification('لطفا مبدا و مقصد را مشخص کنید', 'warning');
      resetButton(submitBtn, originalText);
      return;
    }
    
    // 3. Create order object
    const newOrder = {
      id: Date.now(),
      from: formData.from || 'تهران (IKA)',
      to: formData.to || 'دبی (DXB)',
      date: formData.date || getCurrentDate(),
      item: formData.item || 'مرسوله',
      type: formData.type || 'sender',
      status: 'در انتظار تایید',
      statusColor: 'amber',
      details: {
        weight: formData.weight || 'نامشخص',
        value: formData.value || 'نامشخص',
        description: formData.description || '',
        flightNumber: formData.flightNumber || '',
        ...formData.otherDetails
      },
      createdAt: new Date().toISOString()
    };
    
    console.log('📦 Creating order:', newOrder);
    
    // 4. Add to cart
    console.log('Checking if addOrder exists...');
    if (typeof addOrder === 'undefined') {
      throw new Error('addOrder function is not defined');
    }
    const addedOrder = addOrder(newOrder);
    console.log('✅ Order added:', addedOrder);
    
    // 5. Show success
    showNotification(
      `سفارش شما از ${newOrder.from} به ${newOrder.to} ثبت شد`,
      'success'
    );
    
    // 6. Optional: Clear form
    clearForm();
    
    // 7. Redirect after delay
    setTimeout(() => {
      redirectToMyOrders();
    }, 1500);
    
  } catch (error) {
    console.error('❌ Order submission failed:', error);
    showNotification('خطا در ثبت سفارش. لطفا دوباره تلاش کنید.', 'error');
  } finally {
    // Reset button state
    const submitBtn = document.getElementById('submit-order');
    if (submitBtn) {
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'افزودن به سفارش ها';
        submitBtn.classList.remove('opacity-50');
      }, 1000);
    }
  }
}

// Collect form data
function collectFormData() {
  console.log('🔍 Collecting form data...');
  
  // Try to find form fields with common names
  const data = {
    from: getValue('#from, [name="from"], [data-from], .from-input'),
    to: getValue('#to, [name="to"], [data-to], .to-input'),
    date: getValue('#date, [name="date"], [data-date], .date-input'),
    item: getValue('#item, [name="item"], [data-item], .item-input'),
    weight: getValue('#weight, [name="weight"], [data-weight], .weight-input'),
    value: getValue('#value, [name="value"], [data-value], .value-input'),
    description: getValue('#description, [name="description"], textarea'),
    flightNumber: getValue('#flight, [name="flight"], [data-flight]'),
    type: getSelectedType(),
    otherDetails: collectOtherDetails()
  };
  
  console.log('📝 Collected data:', data);
  return data;
}

function getValue(selector) {
  try {
    const el = document.querySelector(selector);
    if (!el) return null;
    
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      return el.value;
    } else {
      return el.textContent || el.getAttribute('value') || el.getAttribute('data-value');
    }
  } catch (error) {
    console.warn('Error getting value for selector:', selector, error);
    return null;
  }
}

function getSelectedType() {
  // Check radio buttons or selected tabs
  const senderRadio = document.querySelector('input[value="sender"]:checked');
  const carrierRadio = document.querySelector('input[value="carrier"]:checked');
  
  if (carrierRadio) return 'carrier';
  if (senderRadio) return 'sender';
  
  // Check active tabs
  const activeTab = document.querySelector('.tab-active, [data-active="true"]');
  if (activeTab) {
    const tabText = activeTab.textContent.toLowerCase();
    if (tabText.includes('رسانا') || tabText.includes('carrier')) return 'carrier';
    if (tabText.includes('سپارا') || tabText.includes('sender')) return 'sender';
  }
  
  return 'sender'; // default
}

function collectOtherDetails() {
  const details = {};
  
  document.querySelectorAll('[data-detail]').forEach(el => {
    const key = el.getAttribute('data-detail');
    const value = el.value || el.textContent || el.getAttribute('data-value');
    if (key && value) details[key] = value;
  });
  
  return details;
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function clearForm() {
  try {
    document.querySelectorAll('input:not([type="submit"]):not([type="button"]), textarea, select').forEach(el => {
      el.value = '';
    });
  } catch (error) {
    console.warn('Error clearing form:', error);
  }
}

function redirectToMyOrders() {
  console.log('🔄 Redirecting to my orders page...');
  
  // Method 1: If using page classes (like your app)
  const myOrderPage = document.getElementById('page-my-order');
  if (myOrderPage) {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.add('hidden');
    });
    myOrderPage.classList.remove('hidden');
    console.log('✅ Navigated to my-order page');
    return;
  }
  
  // Method 2: Dispatch custom event for router
  const event = new CustomEvent('navigate', { 
    detail: { page: 'my-order' } 
  });
  document.dispatchEvent(event);
  console.log('📤 Dispatched navigate event');
}

function resetButton(button, originalText) {
  if (button) {
    setTimeout(() => {
      button.disabled = false;
      button.textContent = originalText;
      button.classList.remove('opacity-50');
    }, 1000);
  }
}

// Make debugging easier
window.debugOrderForm = () => {
  console.log('=== DEBUG ORDER FORM ===');
  console.log('Submit button exists:', !!document.getElementById('submit-order'));
  console.log('Form data:', collectFormData());
  console.log('Current orders:', JSON.parse(localStorage.getItem('my_orders') || '[]'));
  console.log('=====================');
};

console.log('📦 order-submission.js loaded');