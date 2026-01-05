// Main application entry point
console.log('🚀 App starting...');
import { initRouter, initNavigation } from './router.js';
import { initTheme } from './theme.js';
import { hideAppLoader, forceRemoveLoader, checkLoaderStyles } from './utils/dom.js';
import { initSliders } from './components/sliders.js';
import { initializeOrdersStore } from './utils/order-store.js';
import { initOrderSubmission } from './utils/order-submission.js';



// Import page initializers with error handling
const PAGE_INITIALIZERS = {};

// Dynamically import page initializers with error handling
async function loadPageInitializers() {
  console.log('📦 Loading page initializers...');
  
  const pages = [
    { key: 'traveler-route', path: './pages/traveler-route.js', init: 'initTravelerRoute' },
    { key: 'traveler-flight-date', path: './pages/traveler-flight-date.js', init: 'initTravelerFlightDate' },
    { key: 'my-order', path: './pages/my-order.js', init: 'initMyOrderPage' },
    { key: 'my-trips', path: './pages/my-trips.js', init: 'initMyTripsPage' },
    { key: 'cargo-cat', path: './pages/cargo-categories.js', init: 'initCargoCategories' },
    { key: 'registered-flight', path: './pages/registered-flight.js', init: 'initRegisteredFlightFilters' }
  ];

  for (const page of pages) {
    try {
      const module = await import(page.path);
      if (module[page.init]) {
        PAGE_INITIALIZERS[page.key] = module[page.init];
        console.log(`✅ Loaded: ${page.key}`);
      }
    } catch (error) {
      console.warn(`⚠️ ${page.key} page not available:`, error.message);
    }
  }

  // Load components
  try {
    const { initWeightSlider, initValueSlider } = await import('./components/sliders.js');
    PAGE_INITIALIZERS['cargo-weight'] = initWeightSlider;
    PAGE_INITIALIZERS['cargo-val'] = initValueSlider;
    console.log('✅ Loaded sliders');
  } catch (error) {
    console.warn('⚠️ Slider components not available:', error.message);
  }

  try {
    const { initRouteSelection } = await import('./components/route-selection.js');
    PAGE_INITIALIZERS['cargo-route'] = initRouteSelection;
    console.log('✅ Loaded route selection');
  } catch (error) {
    console.warn('⚠️ Route Selection component not available:', error.message);
  }

  return PAGE_INITIALIZERS;
}

// Import role modal separately
async function initRoleModal() {
  try {
    const { initRoleModal } = await import('./pages/role-modal.js');
    console.log('✅ Loaded role modal');
    return initRoleModal;
  } catch (error) {
    console.warn('⚠️ Role modal not available:', error.message);
    return () => { };
  }
}

// Initialize the application
async function initApp() {
  console.log('🚀 =====================================');
  console.log('🚀 App initialization started');
  console.log('🚀 =====================================');
  
  // Check loader first
  console.log('👁️ Checking loader...');
  if (!checkLoaderStyles()) {
    console.warn('⚠️ Loader not found, forcing app start');
    forceRemoveLoader();
  }
  
  try {
    // Initialize theme (dark/light mode)
    console.log('🎨 Initializing theme...');
    initTheme();

    // Initialize orders store
    console.log('📦 Initializing orders store...');
    initializeOrdersStore();

    // Load page initializers
    console.log('📄 Loading page initializers...');
    const pageInitializers = await loadPageInitializers();

    // Initialize router with page initializers
    console.log('🔄 Initializing router...');
    const router = initRouter(pageInitializers);

    // Initialize navigation
    console.log('🧭 Initializing navigation...');
    initNavigation(router);

    // Initialize role modal
    console.log('👤 Initializing role modal...');
    const roleModalInit = await initRoleModal();
    roleModalInit();

    // Initialize order submission
    console.log('📝 Initializing order submission...');
    initOrderSubmission();

    // Initialize sliders
    console.log('🎚️ Initializing sliders...');
    initSliders();

    // Hide loader with multiple fallbacks
    console.log('👁️ Hiding app loader...');
    
    // Primary method
    hideAppLoader();
    
    // Backup: Force hide after timeout
    setTimeout(() => {
      console.log('🕐 Backup: Force hiding loader...');
      forceRemoveLoader();
    }, 1000);
    
    // Final safety
    setTimeout(() => {
      console.log('🛡️ Final safety: Ensuring loader is gone...');
      forceRemoveLoader();
      
      // Show app is ready
      const appContent = document.querySelector('.app-content, main, #app');
      if (appContent) {
        appContent.style.visibility = 'visible';
        appContent.style.opacity = '1';
      }
      
      console.log('✅ =====================================');
      console.log('✅ App initialization complete!');
      console.log('✅ =====================================');
      
      // Dispatch app ready event
      document.dispatchEvent(new CustomEvent('app-ready'));
    }, 2000);

    // Expose router globally for debugging
    window.router = router;
    
    // Expose debug function
    window.debugApp = () => {
      console.log('=== APP DEBUG INFO ===');
      console.log('Loader exists:', !!document.getElementById('app-loader'));
      console.log('Router:', router ? 'OK' : 'Missing');
      console.log('Page initializers:', Object.keys(PAGE_INITIALIZERS));
      console.log('LocalStorage orders:', JSON.parse(localStorage.getItem('my_orders') || '[]'));
      console.log('========================');
    };

  } catch (error) {
    console.error('❌ =====================================');
    console.error('❌ FATAL: Failed to initialize app:', error);
    console.error('❌ =====================================');
    
    // Force remove loader on error
    forceRemoveLoader();
    
    // Show error state
    document.body.innerHTML = `
      <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div class="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-200">
          <div class="text-center">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
              <span class="material-symbols-outlined text-red-500 text-3xl">error</span>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-3">خطا در بارگذاری برنامه</h1>
            <div class="bg-gray-50 p-4 rounded-lg mb-6 text-right">
              <p class="text-gray-600 text-sm font-medium mb-2">مشکل:</p>
              <p class="text-red-500 font-mono text-sm">${error.message}</p>
            </div>
            <div class="space-y-3">
              <button onclick="location.reload()" 
                      class="w-full py-3.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors shadow-md">
                🔄 تلاش مجدد
              </button>
              <button onclick="window.debugApp()" 
                      class="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors">
                🐛 اطلاعات دیباگ
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-6">اگر مشکل ادامه داشت، لطفاً صفحه را رفرش کنید</p>
          </div>
        </div>
      </div>
    `;
  }
}

// Enhanced DOM ready check
console.log('📋 Initial script load, readyState:', document.readyState);

function startApp() {
  console.log('🎬 Starting app initialization...');
  
  // Small delay to ensure all DOM is ready
  setTimeout(() => {
    initApp();
  }, 50);
}

if (document.readyState === 'loading') {
  console.log('⏳ Waiting for DOM to load...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM fully loaded');
    startApp();
  });
} else {
  console.log('⚡ DOM already ready, starting immediately');
  startApp();
}

// Add emergency loader removal
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'l') {
    console.log('🚨 Emergency loader removal triggered!');
    forceRemoveLoader();
  }
});

export { initApp };