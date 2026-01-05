/**
 * Enhanced Route Selection Component
 * Handles route selection for both cargo and traveler pages
 */

// Cargo Route Selection
export function initRouteSelection() {
  const page = document.querySelector('[data-page="cargo-route"]');
  if (!page) return;

  console.log('Initializing enhanced cargo route selection...');

  // Get DOM elements
  const originInput = page.querySelector('input[placeholder*="مبدأ"]') ||
    page.querySelectorAll('input[type="text"]')[0];
  const destInput = page.querySelector('input[placeholder*="مقصد"]') ||
    page.querySelectorAll('input[type="text"]')[1];

  if (!originInput || !destInput) {
    console.error('Could not find origin/destination inputs');
    return;
  }

  // Setup popular route buttons
  const routeButtons = page.querySelectorAll('.flex-wrap button');

  routeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const spans = Array.from(btn.querySelectorAll('span:not(.material-symbols-outlined)'));
      if (spans.length >= 2) {
        const origin = spans[0].textContent.trim();
        const destination = spans[spans.length - 1].textContent.trim();

        originInput.value = origin;
        destInput.value = destination;

        saveRouteData(origin, destination, 'cargo');
        updateInputStyle(originInput);
        updateInputStyle(destInput);
      }
    });
  });

  // Setup swap button
  const swapBtn = page.querySelector('button[data-action="swap"]');
  if (swapBtn) {
    swapBtn.addEventListener("click", () => {
      const temp = originInput.value;
      originInput.value = destInput.value;
      destInput.value = temp;

      saveRouteData(originInput.value, destInput.value, 'cargo');
      updateInputStyle(originInput);
      updateInputStyle(destInput);
    });
  }

  // Setup suggestion items for cargo page
  const suggestionItems = page.querySelectorAll('.cursor-pointer');
  suggestionItems.forEach(item => {
    item.addEventListener('click', () => {
      handleSuggestionClick(item, originInput, destInput, 'cargo');
    });
  });

  // Setup confirm button
  const confirmButton = page.querySelector('button[data-route="registered-cargo"]');
  if (confirmButton) {
    confirmButton.addEventListener('click', () => {
      if (validateRoute(originInput.value, destInput.value)) {
        saveRouteData(originInput.value, destInput.value, 'cargo');
        navigateToRoute('registered-cargo');
      }
    });
  }

  // Setup back button
  const backButton = page.querySelector('button[data-route="cargo-pic"]');
  if (backButton) {
    backButton.addEventListener('click', () => {
      saveRouteData(originInput.value, destInput.value, 'cargo');
      navigateToRoute('cargo-pic');
    });
  }

  // Setup input validation and styling
  setupInputHandlers(originInput, destInput, 'cargo');

  // Load saved data
  loadSavedRouteData(originInput, destInput, 'cargo');

  // Initial style update
  updateInputStyle(originInput);
  updateInputStyle(destInput);

  console.log('Cargo route selection initialized');
}

// Traveler Route Selection - UPDATED WITH FIXED SUGGESTIONS
export function initTravelerRouteSelection() {
  const page = document.querySelector('[data-page="traveler-route"]');
  if (!page) {
    console.error('Traveler route page not found');
    return;
  }

  console.log('Initializing enhanced traveler route selection...');

  // Get DOM elements using specific IDs
  const originInput = page.querySelector('#origin-input');
  const destInput = page.querySelector('#dest-input');
  const swapBtn = page.querySelector('#swap-button');
  const submitBtn = page.querySelector('#submit-route');
  const backBtn = page.querySelector('header button[data-href="#"]');

  if (!originInput || !destInput) {
    console.error('Could not find origin/destination inputs in traveler route');
    return;
  }

  console.log('Found traveler route inputs:', { originInput, destInput });

  // Setup popular route buttons
  const popularButtons = page.querySelectorAll('.popular-route-btn');
  console.log('Found popular buttons:', popularButtons.length);

  popularButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const origin = btn.dataset.origin ? btn.dataset.origin.trim() :
        btn.querySelector('span:nth-child(1)')?.textContent.trim();
      const destination = btn.dataset.destination ? btn.dataset.destination.trim() :
        btn.querySelector('span:nth-child(3)')?.textContent.trim();

      if (origin && destination) {
        console.log('Setting popular route:', { origin, destination });
        originInput.value = origin;
        destInput.value = destination;

        saveRouteData(origin, destination, 'traveler');
        updateInputStyle(originInput);
        updateInputStyle(destInput);

        // Enable submit button if validation passes
        if (submitBtn) {
          submitBtn.disabled = !validateRoute(origin, destination, false);
        }
      }
    },{once:true});
  });

  // Setup swap button
  if (swapBtn) {
    swapBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      console.log('Swapping inputs');
      const temp = originInput.value;
      originInput.value = destInput.value;
      destInput.value = temp;

      saveRouteData(originInput.value, destInput.value, 'traveler');
      updateInputStyle(originInput);
      updateInputStyle(destInput);

      // Update submit button state
      if (submitBtn) {
        submitBtn.disabled = !validateRoute(originInput.value, destInput.value, false);
      }
    },{once:true});
  }

  // FIXED: Setup airport suggestions with better selector
  const airportSuggestions = page.querySelectorAll('.airport-suggestion');
  console.log('Found airport suggestions:', airportSuggestions.length);

  airportSuggestions.forEach(item => {
    // Remove any existing listeners first to avoid duplicates
    item.replaceWith(item.cloneNode(true));
  });

  // Re-select after cloning
  const freshSuggestions = page.querySelectorAll('.airport-suggestion');
  console.log('Fresh airport suggestions after clone:', freshSuggestions.length);

  freshSuggestions.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      console.log('Airport suggestion clicked:', item);
      handleSuggestionClick(item, originInput, destInput, 'traveler', submitBtn);
    });

    // Add hover effect
    item.addEventListener('mouseenter', () => {
      item.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
    });

    item.addEventListener('mouseleave', () => {
      item.style.backgroundColor = '';
    });
  });

  // Setup submit button
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      console.log('Submit button clicked');

      if (validateRoute(originInput.value, destInput.value)) {
        saveRouteData(originInput.value, destInput.value, 'traveler');

        // Disable button temporarily to prevent multiple clicks
        submitBtn.disabled = true;
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = `
          <span>در حال انتقال...</span>
          <span class="material-symbols-outlined animate-spin">refresh</span>
        `;

        // Navigate to next page
        setTimeout(() => {
          navigateToRoute('traveler-flight-date');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
        }, 800);
      }
    } ,{once:true} );
  }

  // Setup back button
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      saveRouteData(originInput.value, destInput.value, 'traveler');

      // Go back in history or to specific route
      if (window.history.length > 1) {
        window.history.back();
      } else {
        navigateToRoute('home'); // یا نام مسیر قبلی
      }
    }, {once:true});
  }

  // Setup input validation and styling
  setupInputHandlers(originInput, destInput, 'traveler', submitBtn);

  // Load saved data
  loadSavedRouteData(originInput, destInput, 'traveler');

  // Initial style update and button state
  updateInputStyle(originInput);
  updateInputStyle(destInput);

  if (submitBtn) {
    const isValid = validateRoute(originInput.value, destInput.value, false);
    submitBtn.disabled = !isValid;
    console.log('Initial submit button state:', isValid ? 'enabled' : 'disabled');
  }

  // Add event delegation for dynamic elements
  setupEventDelegation(page);

  console.log('Traveler route selection initialized successfully');
}

// Helper function to handle suggestion clicks
function handleSuggestionClick(item, originInput, destInput, type, submitBtn = null) {
  const title = item.querySelector('.text-sm.font-bold')?.textContent.trim();
  const airport = item.dataset.airport || '';
  const code = item.dataset.code || '';

  let displayText = title;
  if (airport && code) {
    displayText = `${airport} (${code})`;
  }

  console.log('Suggestion clicked:', { title, airport, code, displayText });

  // Determine which input is focused
  const focusedInput = document.activeElement;

  if (focusedInput === originInput) {
    originInput.value = displayText;
    updateInputStyle(originInput);
  } else if (focusedInput === destInput) {
    destInput.value = displayText;
    updateInputStyle(destInput);
  } else {
    // If no input is focused, check which one is empty or fill both
    if (!originInput.value.trim()) {
      originInput.value = displayText;
      originInput.focus();
      updateInputStyle(originInput);
    } else if (!destInput.value.trim()) {
      destInput.value = displayText;
      destInput.focus();
      updateInputStyle(destInput);
    } else {
      // Both inputs have values - let user choose
      showInputSelector(originInput, destInput, displayText, type);
    }
  }

  // Save to localStorage
  saveRouteData(originInput.value, destInput.value, type);

  // Update submit button state if provided
  if (submitBtn) {
    const isValid = validateRoute(originInput.value, destInput.value, false);
    submitBtn.disabled = !isValid;
  }
}

// Helper function to set up input handlers
function setupInputHandlers(originInput, destInput, type, submitBtn = null) {
  const inputs = [originInput, destInput];

  inputs.forEach(input => {
    // Remove existing listeners to avoid duplicates
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
  });

  // Get fresh references
  const freshOriginInput = type === 'cargo' ?
    document.querySelector('[data-page="cargo-route"] input[placeholder*="مبدأ"]') :
    document.querySelector('#origin-input');

  const freshDestInput = type === 'cargo' ?
    document.querySelector('[data-page="cargo-route"] input[placeholder*="مقصد"]') :
    document.querySelector('#dest-input');

  [freshOriginInput, freshDestInput].forEach(input => {
    if (!input) return;

    input.addEventListener('input', () => {
      updateInputStyle(input);

      if (submitBtn) {
        const isValid = validateRoute(freshOriginInput.value, freshDestInput.value, false);
        submitBtn.disabled = !isValid;
      }

      // Auto-save after a delay
      debounce(() => {
        saveRouteData(freshOriginInput.value, freshDestInput.value, type);
      }, 500);
    });

    input.addEventListener('focus', () => {
      const parent = input.closest('.group');
      if (parent) {
        parent.classList.add('border-primary/50');
        parent.classList.remove('border-transparent');
      }
    });

    input.addEventListener('blur', () => {
      updateInputStyle(input);
    });

    // Add keyboard support
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Move focus to next input or submit
        if (input === freshOriginInput) {
          freshDestInput.focus();
        } else if (input === freshDestInput && submitBtn && !submitBtn.disabled) {
          submitBtn.click();
        }
      }
    });
  });
}

// Helper function for event delegation
function setupEventDelegation(page) {
  // Delegate clicks for popular routes - HANDLE DIRECTLY
  const popularRoutesContainer = page.querySelector('#popular-routes');
  if (popularRoutesContainer) {
    popularRoutesContainer.addEventListener('click', (e) => {
      const button = e.target.closest('.popular-route-btn');
      if (button) {
        e.preventDefault();
        e.stopPropagation();
        
        // Handle the click directly instead of re-dispatching
        const origin = button.dataset.origin?.trim() || 
                      button.querySelector('span:nth-child(1)')?.textContent.trim();
        const destination = button.dataset.destination?.trim() || 
                          button.querySelector('span:nth-child(3)')?.textContent.trim();
        
        if (origin && destination) {
          const originInput = page.querySelector('#origin-input');
          const destInput = page.querySelector('#dest-input');
          const submitBtn = page.querySelector('#submit-route');
          
          if (originInput && destInput) {
            originInput.value = origin;
            destInput.value = destination;
            
            saveRouteData(origin, destination, 'traveler');
            updateInputStyle(originInput);
            updateInputStyle(destInput);
            
            if (submitBtn) {
              submitBtn.disabled = !validateRoute(origin, destination, false);
            }
          }
        }
      }
    });
  }
  
  // Remove the suggestions delegation or fix it similarly
  // ...
}

// Helper function to show input selector (when both inputs are filled)
function showInputSelector(originInput, destInput, value, type) {
  // In a real app, you might show a modal or dropdown
  // For now, we'll use a simple prompt
  const choice = prompt(
    `"${value}" را برای کدام فیلد می‌خواهید؟\n\n1. مبدأ\n2. مقصد\n\nعدد مورد نظر را وارد کنید:`
  );

  if (choice === '1') {
    originInput.value = value;
    originInput.focus();
  } else if (choice === '2') {
    destInput.value = value;
    destInput.focus();
  }

  saveRouteData(originInput.value, destInput.value, type);
}

// Utility Functions (same as before, but with minor improvements)

function saveRouteData(origin, destination, type = 'cargo') {
  const data = {
    origin: origin.trim(),
    destination: destination.trim(),
    timestamp: new Date().toISOString(),
    type: type
  };

  try {
    if (type === 'cargo') {
      localStorage.setItem('cargoRoute', JSON.stringify(data));
      sessionStorage.setItem('currentCargoRoute', JSON.stringify(data));
    } else {
      localStorage.setItem('travelerRoute', JSON.stringify(data));
      sessionStorage.setItem('currentTravelerRoute', JSON.stringify(data));
    }
    console.log(`${type} route data saved:`, data);
  } catch (error) {
    console.error(`Error saving ${type} route data:`, error);
  }
}

function loadSavedRouteData(originInput, destInput, type = 'cargo') {
  try {
    let savedData;
    if (type === 'cargo') {
      savedData = sessionStorage.getItem('currentCargoRoute') || localStorage.getItem('cargoRoute');
    } else {
      savedData = sessionStorage.getItem('currentTravelerRoute') || localStorage.getItem('travelerRoute');
    }

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.origin) originInput.value = parsedData.origin;
      if (parsedData.destination) destInput.value = parsedData.destination;
      console.log(`Loaded saved ${type} route:`, parsedData);
    }
  } catch (error) {
    console.error(`Error loading saved ${type} route:`, error);
  }
}

function validateRoute(origin, destination, showAlert = true) {
  origin = origin.trim();
  destination = destination.trim();

  if (!origin || !destination) {
    if (showAlert) {
      showToast('لطفاً هم مبدأ و هم مقصد را وارد کنید', 'error');
    }
    return false;
  }

  if (origin === destination) {
    if (showAlert) {
      showToast('مبدأ و مقصد نمی‌توانند یکسان باشند', 'error');
    }
    return false;
  }

  if (origin.length < 2 || destination.length < 2) {
    if (showAlert) {
      showToast('نام مبدأ و مقصد باید حداقل ۲ کاراکتر باشد', 'error');
    }
    return false;
  }

  return true;
}

function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
    }`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function updateInputStyle(input) {
  const parent = input.closest('.group');
  if (!parent) return;

  const value = input.value.trim();

  if (value.length > 0) {
    parent.classList.add('has-value');
    if (value.length < 2) {
      parent.classList.add('border-yellow-500');
      parent.classList.remove('border-primary/50', 'border-transparent');
    } else {
      parent.classList.remove('border-yellow-500');
      parent.classList.add('border-primary/50');
    }
  } else {
    parent.classList.remove('has-value', 'border-yellow-500', 'border-primary/50');
    parent.classList.add('border-transparent');
  }
}

// Debounce utility
let debounceTimer;
function debounce(func, delay) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
}

function navigateToRoute(routeName) {
  const routeChangeEvent = new CustomEvent('routeChange', {
    detail: { route: routeName }
  });
  window.dispatchEvent(routeChangeEvent);
}

// Export utility functions
export function getCurrentRoute(type = 'cargo') {
  try {
    const key = type === 'cargo' ? 'cargoRoute' : 'travelerRoute';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error getting current route:', error);
    return null;
  }
}

export function clearRouteData(type = 'cargo') {
  if (type === 'cargo') {
    localStorage.removeItem('cargoRoute');
    sessionStorage.removeItem('currentCargoRoute');
  } else {
    localStorage.removeItem('travelerRoute');
    sessionStorage.removeItem('currentTravelerRoute');
  }
  console.log(`${type} route data cleared`);
}