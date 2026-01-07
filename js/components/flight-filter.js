/**
 * Flight Filtering System for Registered Flights
 */
let isInitialized = false;
let filterTimeout = null;

// Define showToast function if not already defined
function showToast(message, type = 'info') {
  // Remove any existing toasts
  document.querySelectorAll('.custom-toast').forEach(toast => toast.remove());
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `custom-toast fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-lg ${type === 'error' ? 'bg-red-500 text-white' : 
                    type === 'success' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`;
  
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
        <span class="material-symbols-outlined">
          ${type === 'error' ? 'error' : type === 'success' ? 'check_circle' : 'info'}
        </span>
      </div>
      <div class="flex-1">
        <p class="font-medium">${message}</p>
      </div>
      <button class="toast-close text-white/80 hover:text-white">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
  `;

  document.body.appendChild(toast);

  // Add animation
  toast.style.animation = 'slideDown 0.3s ease-out';
  
  // Close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.style.animation = 'slideUp 0.3s ease-out';
    
  });

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'slideUp 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}

export function initFlightFiltering() {
  const page = document.querySelector('[data-page="registered-flight"]');
  if (!page) return;

  // Prevent multiple initializations
  if (isInitialized) {
    console.log('Flight filtering already initialized, skipping...');
    return;
  }

  console.log('Initializing flight filtering...');
  isInitialized = true;

  // Get filter elements - use correct ID for category select
  const priceRange = page.querySelector('#registered-flight-price-range');
  const priceDisplay = page.querySelector('#registered-flight-price-display');
  const categorySelect = page.querySelector('#flight-category-select'); // Changed ID!
  
  // Debug: Log all elements to see what's available
  console.log('Filter elements found:', {
    priceRange: !!priceRange,
    priceDisplay: !!priceDisplay,
    categorySelect: !!categorySelect
  });

  // Get clear button by finding the button with "پاک کردن" text
  const allButtons = page.querySelectorAll('button');
  let clearButton = null;
  let searchButton = null;
  
  allButtons.forEach(button => {
    const text = button.textContent.trim();
    if (text.includes('پاک کردن')) {
      clearButton = button;
      console.log('Found clear button:', clearButton);
    }
    if (text.includes('جستجو')) {
      searchButton = button;
      console.log('Found search button:', searchButton);
    }
  });
  
  // Get only actual flight cards, not the filter container
  // The filter container is the first card, we need to exclude it
  let allCards = Array.from(page.querySelectorAll('.rounded-2xl.bg-surface-light'));
  
  // Filter out the filter container (first card which contains filter elements)
  const cards = allCards.filter(card => {
    // Check if this is the filter container
    const hasFilterHeader = card.textContent.includes('فیلترها');
    const hasCategorySelect = card.querySelector('#flight-category-select');
    const hasPriceSlider = card.querySelector('#registered-flight-price-range');
    
    // If it has any of these, it's the filter container, not a flight card
    return !hasFilterHeader && !hasCategorySelect && !hasPriceSlider;
  });

  console.log('Total flight cards found (excluding filter container):', cards.length);
  
  // Debug: Log first card if found
  if (cards.length > 0) {
    console.log('First flight card HTML:', cards[0].outerHTML);
  }

  // Initialize price display
  if (priceRange && priceDisplay) {
    priceDisplay.textContent = `${priceRange.value} OMR`;
    
    // Update price display when slider changes with debouncing
    priceRange.addEventListener('input', (e) => {
      priceDisplay.textContent = `${e.target.value} OMR`;
      
      // Debounce filter application
      clearTimeout(filterTimeout);
      filterTimeout = setTimeout(() => {
        applyFilters();
      }, 300);
    });
  } else {
    console.warn('Price range or display not found');
  }

  // Initialize clear button
  if (clearButton) {
    // Remove existing listeners by cloning
    const newClearButton = clearButton.cloneNode(true);
    clearButton.parentNode.replaceChild(newClearButton, clearButton);
    newClearButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      resetFilters();
    });
    console.log('Clear button event listener added');
  } else {
    console.warn('Clear button not found');
  }

  // Initialize search button
  if (searchButton) {
    // Remove existing listeners by cloning
    const newSearchButton = searchButton.cloneNode(true);
    searchButton.parentNode.replaceChild(newSearchButton, searchButton);
    newSearchButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      applyFilters();
      showToast('جستجو انجام شد', 'success');
    });
    console.log('Search button event listener added');
  } else {
    console.warn('Search button not found');
  }

  // Initialize category select
  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      clearTimeout(filterTimeout);
      filterTimeout = setTimeout(() => {
        applyFilters();
      }, 300);
    });
    console.log('Category select event listener added');
  } else {
    console.warn('Category select not found - looking for #flight-category-select');
  }

  // Only apply filters if we have cards
  if (cards.length > 0) {
    // Apply filters on page load with a delay
    setTimeout(() => {
      applyFilters();
    }, 500);
  } else {
    console.error('No flight cards found to filter!');
    // Show error message
    showNoCardsMessage();
  }

  /**
   * Show message when no cards are found
   */
  function showNoCardsMessage() {
    const cardsContainer = page.querySelector('.flex.flex-col.gap-4.px-4.mt-2');
    if (cardsContainer) {
      const message = document.createElement('div');
      message.className = 'text-center py-8 text-slate-500 dark:text-slate-400';
      message.innerHTML = `
        <span class="material-symbols-outlined text-4xl mb-4">flight_takeoff</span>
        <p>در حال حاضر هیچ بسته ای برای ارسال ثبت نشده است.</p>
      `;
      cardsContainer.appendChild(message);
    }
  }

  /**
   * Reset all filters to default values
   */
  function resetFilters() {
    console.log('Resetting filters...');
    
    // Reset price range
    if (priceRange) {
      priceRange.value = 100;
      if (priceDisplay) {
        priceDisplay.textContent = '100 OMR';
      }
    }
    
    // Reset category select
    if (categorySelect) {
      categorySelect.value = '';
    }
    
    // Show all flight cards
    cards.forEach(card => {
      card.style.display = 'flex';
      card.classList.remove('filtered-out');
    });
    
    // Remove any existing results message
    const existingMessage = page.querySelector('.filter-results-message');
    if (existingMessage) existingMessage.remove();
    
    showToast('فیلترها پاک شدند', 'success');
  }

  /**
   * Apply filters based on selected criteria
   */
  function applyFilters() {
    if (cards.length === 0) {
      console.log('No cards to filter');
      return;
    }
    
    console.log('Applying filters to', cards.length, 'cards...');
    
    const selectedPrice = priceRange ? parseInt(priceRange.value) : 200;
    const selectedCategory = categorySelect ? categorySelect.value : '';
    
    let visibleCount = 0;
    
    cards.forEach((card, index) => {
      const priceElement = card.querySelector('.text-primary.font-bold.text-lg');
      const categoryBadges = card.querySelectorAll('[class*="rounded-md"]');
      
      // Extract price from card
      let cardPrice = 0;
      if (priceElement) {
        const priceText = priceElement.textContent.trim();
        cardPrice = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
      }
      
      // Extract category from badges
      let cardCategory = '';
      categoryBadges.forEach(badge => {
        const badgeText = badge.textContent.trim();
        
        // Map Persian category names to English values
        if (badgeText.includes('مدارک')) {
          cardCategory = 'docs';
        } else if (badgeText.includes('ساعت')) {
          cardCategory = 'electronics';
        } else if (badgeText.includes('الکترونیک')) {
          cardCategory = 'electronics';
        } else if (badgeText.includes('پوشاک')) {
          cardCategory = 'clothes';
        } else if (badgeText.includes('اشیاء قیمتی')) {
          cardCategory = 'valuables';
        }
      });
      
      // Check if card matches filters
      const priceMatches = cardPrice <= selectedPrice;
      const categoryMatches = !selectedCategory || selectedCategory === '' || cardCategory === selectedCategory;
      
      if (priceMatches && categoryMatches) {
        card.style.display = 'flex';
        card.classList.remove('filtered-out');
        visibleCount++;
      } else {
        card.style.display = 'none';
        card.classList.add('filtered-out');
      }
    });
    
    // Show message if no results
    if (cards.length > 0) {
      showResultsMessage(visibleCount);
    }
    
    console.log(`Filters applied: ${visibleCount} of ${cards.length} flights visible`);
  }

  /**
   * Show message based on filter results
   */
  function showResultsMessage(visibleCount) {
    // Remove existing message
    const existingMessage = page.querySelector('.filter-results-message');
    if (existingMessage) existingMessage.remove();
    
    if (visibleCount === 0 && cards.length > 0) {
      // Create and show no results message
      const messageContainer = document.createElement('div');
      messageContainer.className = 'filter-results-message px-4 mt-4';
      messageContainer.innerHTML = `
        <div class="text-center py-8">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <span class="material-symbols-outlined text-slate-400 text-[24px]">search_off</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">نتیجه‌ای یافت نشد</h3>
          <p class="text-slate-600 dark:text-slate-300 text-sm mb-4">با تنظیمات فعلی فیلتر، پروازی پیدا نشد.</p>
          <button id="reset-filter-btn" class="px-6 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-colors">
            بازنشانی فیلترها
          </button>
        </div>
      `;
      
      const cardsContainer = page.querySelector('.flex.flex-col.gap-4.px-4.mt-2');
      if (cardsContainer) {
        cardsContainer.parentNode.insertBefore(messageContainer, cardsContainer.nextSibling);
        
        // Add event listener to reset button
        const resetBtn = messageContainer.querySelector('#reset-filter-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            resetFilters();
          });
        }
      }
    }
  }

  // Add CSS for filtering animations
  addFilterStyles();
  
  console.log('Flight filtering initialized successfully');
}

/**
 * Add CSS styles for filtering effects
 */
function addFilterStyles() {
  if (document.getElementById('filter-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'filter-styles';
  style.textContent = `
    .filtered-out {
      display: none !important;
    }
    
    /* Improve range slider styling */
    #registered-flight-price-range {
      height: 6px;
      border-radius: 3px;
    }
    
    #registered-flight-price-range::-webkit-slider-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      -webkit-appearance: none;
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
    }
    
    #registered-flight-price-range::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
    }
    
    /* Toast animations */
    @keyframes slideDown {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideUp {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(-100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Cleanup function to reset initialization state
 */
export function cleanupFlightFiltering() {
  isInitialized = false;
  if (filterTimeout) {
    clearTimeout(filterTimeout);
    filterTimeout = null;
  }
}

/**
 * Initialize filtering when page is shown
 */
let observer = null;

export function setupFlightPage() {
  // Clean up any existing observer
  if (observer) {
    observer.disconnect();
  }
  
  // Initialize if on the flight page
  const flightPage = document.querySelector('[data-page="registered-flight"]');
  if (flightPage && !flightPage.classList.contains('hidden')) {
    setTimeout(() => initFlightFiltering(), 300);
  }

  // Set up observer for page changes
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const flightPage = document.querySelector('[data-page="registered-flight"]');
        
        // Clean up when leaving the page
        if (flightPage && flightPage.classList.contains('hidden')) {
          cleanupFlightFiltering();
        }
        
        // Initialize when entering the page
        if (flightPage && !flightPage.classList.contains('hidden')) {
          // Small delay to ensure DOM is ready
          setTimeout(() => initFlightFiltering(), 300);
        }
      }
    });
  });

  // Observe page visibility changes
  const pages = document.querySelectorAll('[data-page]');
  pages.forEach(page => {
    observer.observe(page, { attributes: true, attributeFilter: ['class'] });
  });
}
window.addEventListener('pageshow', () => {
  // Allow initFlightFiltering to run again
  isInitialized = false;

  // If filtering was already initialized, force a clean reset
  const page = document.querySelector('[data-page="registered-flight"]');
  if (!page) return;

  // Reset UI elements safely (no dependency on init order)
  const priceRange = page.querySelector('#registered-flight-price-range');
  const priceDisplay = page.querySelector('#registered-flight-price-display');
  const categorySelect = page.querySelector('#flight-category-select');

  if (priceRange) {
    priceRange.value = 100;
    priceRange.dispatchEvent(new Event('input'));
  }

  if (priceDisplay) {
    priceDisplay.textContent = '100 OMR';
  }

  if (categorySelect) {
    categorySelect.value = '';
    categorySelect.dispatchEvent(new Event('change'));
  }

  // Show all cards
  page.querySelectorAll('.rounded-2xl.bg-surface-light').forEach(card => {
    card.style.display = 'flex';
    card.classList.remove('filtered-out');
  });

  console.log('Filters hard-reset on page load');
});
// Auto-initialize if this script is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupFlightPage);
} else {
  setupFlightPage();
}

// Export showToast if needed elsewhere
export { showToast };