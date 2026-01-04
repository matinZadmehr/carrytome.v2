// Main application entry point
import { initRouter, initNavigation } from './router.js';
import { initTheme } from './theme.js';
import { hideAppLoader } from './utils/dom.js';
import { initSliders } from './components/sliders.js';
initSliders();
// Import page initializers with error handling
const PAGE_INITIALIZERS = {};

// Dynamically import page initializers with error handling
async function loadPageInitializers() {

  // --- REMOVED THE SLIDER IMPORT BLOCK FROM HERE ---
  // The slider logic is now inside pages/traveler-capacity.js

  try {
    // NOTE: You had a duplicate for 'traveler-route' too. 
    // You should combine initTravelerRouteSelection inside pages/traveler-route.js
    const { initTravelerRoute } = await import('./pages/traveler-route.js');
    PAGE_INITIALIZERS['traveler-route'] = initTravelerRoute;
  } catch (error) {
    console.warn('Traveler Route page not available:', error.message);
  }

  try {
    const { initTravelerFlightDate } = await import('./pages/traveler-flight-date.js');
    PAGE_INITIALIZERS['traveler-flight-date'] = initTravelerFlightDate;
  } catch (error) {
    console.warn('Traveler Flight Date page not available:', error.message);
  }

  try {
    // This is the ONLY place 'traveler-capacity' should be defined
    const { initTravelerCapacity } = await import('./pages/traveler-capacity.js');
    PAGE_INITIALIZERS['traveler-capacity'] = initTravelerCapacity;
  } catch (error) {
    console.warn('Traveler Capacity page not available:', error.message);
  }

  try {
    const { initMyOrderPage } = await import('./pages/my-order.js');
    PAGE_INITIALIZERS['my-order'] = initMyOrderPage;
  } catch (error) {
    console.warn('My Order page not available:', error.message);
  }

  try {
    const { initMyTripsPage } = await import('./pages/my-trips.js');
    PAGE_INITIALIZERS['my-trips'] = initMyTripsPage;
  } catch (error) {
    console.warn('My Trips page not available:', error.message);
  }

  try {
    const { initCargoCategories } = await import('./pages/cargo-categories.js');
    PAGE_INITIALIZERS['cargo-cat'] = initCargoCategories;
  } catch (error) {
    console.warn('Cargo Categories page not available:', error.message);
  }

  try {
    const { initRegisteredFlightFilters } = await import('./pages/registered-flight.js');
    PAGE_INITIALIZERS['registered-flight'] = initRegisteredFlightFilters;
  } catch (error) {
    console.warn('Registered Flight page not available:', error.message);
  }

  try {
    const { initWeightSlider, initValueSlider } = await import('./components/sliders.js');
    // These keys are unique, so they are fine to stay here if they are separate pages
    PAGE_INITIALIZERS['cargo-weight'] = initWeightSlider;
    PAGE_INITIALIZERS['cargo-val'] = initValueSlider;
  } catch (error) {
    console.warn('Slider components not available:', error.message);
  }

  try {
    const { initRouteSelection } = await import('./components/route-selection.js');
    PAGE_INITIALIZERS['cargo-route'] = initRouteSelection;
  } catch (error) {
    console.warn('Route Selection component not available:', error.message);
  }

  return PAGE_INITIALIZERS;
}

// Import role modal separately
async function initRoleModal() {
  try {
    const { initRoleModal } = await import('./pages/role-modal.js');
    return initRoleModal;
  } catch (error) {
    console.warn('Role modal not available:', error.message);
    return () => { };
  }
}

// Initialize the application
async function initApp() {
  try {
    // Initialize theme (dark/light mode)
    initTheme();

    // Load page initializers
    const pageInitializers = await loadPageInitializers();

    // Initialize router with page initializers
    const router = initRouter(pageInitializers);

    // Initialize navigation
    initNavigation(router);

    // Initialize role modal (not page-specific)
    const roleModalInit = await initRoleModal();
    roleModalInit();

    // Hide loader
    setTimeout(hideAppLoader, 100);

    // Safety timeout
    setTimeout(hideAppLoader, 2500);

    // Expose router globally
    window.router = router;

    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Show error state
    hideAppLoader();
    document.body.innerHTML = `
      <div class="p-4 text-center">
        <h1 class="text-xl text-red-600 mb-2">Error Loading App</h1>
        <p class="text-gray-600">${error.message}</p>
        <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Reload App
        </button>
      </div>
    `;
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

export { initApp };
