/**
 * Enhanced Route Selection Component with Drag & Drop
 * Handles route selection for both cargo and traveler pages
 */

// Cargo Route Selection
export function initRouteSelection() {
  const page = document.querySelector('[data-page="cargo-route"]');
  if (!page) return;

  console.log('Initializing enhanced cargo route selection...');
  
  // Initialize drag and drop
  initDragAndDrop(page, 'cargo');

  // Get DOM elements
  let originInput = page.querySelector('input[placeholder*="مبدأ"]') ||
    page.querySelectorAll('input[type="text"]')[0];
  let destInput = page.querySelector('input[placeholder*="مقصد"]') ||
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
    
    // Make suggestions draggable
    makeDraggable(item, 'cargo', originInput, destInput);
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

// Traveler Route Selection with Drag & Drop
export function initTravelerRouteSelection() {
  const page = document.querySelector('[data-page="traveler-route"]');
  if (!page) {
    console.error('Traveler route page not found');
    return;
  }

  console.log('Initializing enhanced traveler route selection with drag & drop...');
  
  // Initialize drag and drop
  initDragAndDrop(page, 'traveler');

  // Get DOM elements using specific IDs
  let originInput = page.querySelector('#origin-input');
  let destInput = page.querySelector('#dest-input');
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
    }, );
  });

  // Setup swap button
  if (swapBtn) {
  swapBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Swapping inputs');
    
    // Store current values
    const originValue = originInput.value;
    const destValue = destInput.value;
    
    // Swap values
    originInput.value = destValue;
    destInput.value = originValue;

    // Force trigger input events with all necessary details
    const triggerEvents = (input) => {
      // Trigger input event
      const inputEvent = new Event('input', {
        bubbles: true,
        cancelable: true
      });
      input.dispatchEvent(inputEvent);
      
      // Trigger change event
      const changeEvent = new Event('change', {
        bubbles: true,
        cancelable: true
      });
      input.dispatchEvent(changeEvent);
      
      // Trigger focus/blur to force style updates
      input.dispatchEvent(new Event('focus'));
      input.dispatchEvent(new Event('blur'));
    };

    // Trigger events for both inputs
    triggerEvents(originInput);
    triggerEvents(destInput);
    
    // Manually update styles
    updateInputStyle(originInput);
    updateInputStyle(destInput);
    
    // Force placeholder update
    updatePlaceholderVisibility(originInput);
    updatePlaceholderVisibility(destInput);

    saveRouteData(originInput.value, destInput.value, 'traveler');

    // Update submit button state
    if (submitBtn) {
      submitBtn.disabled = !validateRoute(originInput.value, destInput.value, false);
    }
    
    // Visual feedback
    swapBtn.classList.add('swap-active');
    setTimeout(() => {
      swapBtn.classList.remove('swap-active');
    }, 300);
    
    console.log('After swap:', {
      origin: originInput.value,
      destination: destInput.value
    });
  }, );
}

  // Setup airport suggestions
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
    // Click handler
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Airport suggestion clicked:', item);
      handleSuggestionClick(item, originInput, destInput, 'traveler', submitBtn);
    });

    // Make draggable
    makeDraggable(item, 'traveler', originInput, destInput);

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
    }, );
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
        navigateToRoute('home');
      }
    }, );
  }

  // Setup input validation and styling
  ({ originInput, destInput } =
  setupInputHandlers(originInput, destInput, 'traveler', submitBtn));

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

  console.log('Traveler route selection initialized successfully');
}
//=====helper functions for drag & drop=====

// ===================== MISSING UTILITY FUNCTIONS =====================

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
     return {
    originInput: freshOriginInput,
    destInput: freshDestInput
  };
}

// Helper function to update input style


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
    
    // Hide placeholder if exists
    const placeholder = parent.querySelector('.drop-placeholder');
    if (placeholder) {
      placeholder.style.opacity = '0';
      setTimeout(() => {
        if (input.value.trim()) {
          placeholder.style.display = 'none';
        }
      }, 300);
    }
  } else {
    parent.classList.remove('has-value', 'border-yellow-500', 'border-primary/50');
    parent.classList.add('border-transparent');
    
    // Show placeholder if exists
    const placeholder = parent.querySelector('.drop-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
      placeholder.style.opacity = '0.6';
    }
  }
}

// Function to save route data
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

// Function to load saved route data
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

// Function to validate route
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

// Function to show toast notification
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
    setTimeout(() => toast.remove(), 300);
  });

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'slideUp 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}

// Debounce utility
let debounceTimer;
function debounce(func, delay) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
}

// Function to navigate to route
function navigateToRoute(routeName) {
  if (window.router) {
    window.router.navigate(routeName);
  } else {
    window.location.hash = `#/${routeName}`;
  }
}

// Add animation styles if not already present
if (!document.querySelector('#toast-animations')) {
  const style = document.createElement('style');
  style.id = 'toast-animations';
  style.textContent = `
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
// ===================== DRAG & DROP FUNCTIONALITY =====================

function initDragAndDrop(page, type) {
  console.log(`Initializing drag & drop for ${type}...`);
  
  // Add CSS for drag & drop
  addDragDropStyles();
  
  // Make input fields droppable
  let originInput = type === 'cargo' 
    ? page.querySelector('input[placeholder*="مبدأ"]') || page.querySelectorAll('input[type="text"]')[0]
    : page.querySelector('#origin-input');
    
  let destInput = type === 'cargo'
    ? page.querySelector('input[placeholder*="مقصد"]') || page.querySelectorAll('input[type="text"]')[1]
    : page.querySelector('#dest-input');
  
  if (originInput) makeDroppable(originInput, 'origin', type);
  if (destInput) makeDroppable(destInput, 'destination', type);
  
  // Create drag ghost element
  createDragGhost();
}

function addDragDropStyles() {
  if (document.getElementById('drag-drop-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'drag-drop-styles';
  style.textContent = `
    .swap-active {
    transform: rotate(180deg);
    transition: transform 0.3s ease;
  }

  .swap-button {
    transition: all 0.3s ease;
  }

  .swap-button:hover {
    background-color: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
    }
    .draggable {
      cursor: grab;
      user-select: none;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
    
    .draggable:active {
      cursor: grabbing;
    }
    
    .dragging {
      opacity: 0.5;
      transform: scale(0.95);
      z-index: 1000;
    }
    
    .drop-target {
      transition: all 0.3s ease;
    }
    
    .drop-hover {
      border-color: #3b82f6 !important;
      background-color: rgba(59, 130, 246, 0.05) !important;
      transform: scale(1.02);
    }
    
    .drop-success {
      border-color: #10b981 !important;
      background-color: rgba(16, 185, 129, 0.05) !important;
    }
    
    #drag-ghost {
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.8;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 12px;
      padding: 12px 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      border: 2px solid #3b82f6;
      max-width: 200px;
      display: none;
    }
    
    #drag-ghost .drag-content {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: #1e293b;
    }
    
    #drag-ghost .drag-icon {
      color: #3b82f6;
    }
    
    .drag-indicator {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    .draggable:hover .drag-indicator {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
}

function createDragGhost() {
  if (document.getElementById('drag-ghost')) return;
  
  const ghost = document.createElement('div');
  ghost.id = 'drag-ghost';
  ghost.innerHTML = `
    <div class="drag-content">
      <span class="material-symbols-outlined drag-icon">drag_indicator</span>
      <span class="drag-text"></span>
    </div>
  `;
  document.body.appendChild(ghost);
}

function makeDraggable(element, type, originInput, destInput) {
  if (!element) return;
  
  // Add draggable class
  element.classList.add('draggable');
  
  // Add drag indicator
  const indicator = document.createElement('div');
  indicator.className = 'drag-indicator';
  indicator.innerHTML = '<span class="material-symbols-outlined" style="font-size: 14px">drag_indicator</span>';
  element.appendChild(indicator);
  
  let isDragging = false;
  let startX, startY;
  let dragData = null;
  
  // Touch events for mobile
  element.addEventListener('touchstart', handleDragStart, { passive: false });
  element.addEventListener('touchmove', handleDragMove, { passive: false });
  element.addEventListener('touchend', handleDragEnd);
  
  // Mouse events for desktop
  element.addEventListener('mousedown', handleDragStart);
  
  function handleDragStart(e) {
    e.preventDefault();
    e.stopPropagation();
    
    isDragging = true;
    
    // Get drag data from the element
    const title = element.querySelector('.text-sm.font-bold')?.textContent.trim();
    const airport = element.dataset.airport || '';
    const code = element.dataset.code || '';
    
    dragData = {
      text: airport && code ? `${airport} (${code})` : title,
      element: element,
      type: type
    };
    
    // Set starting position
    if (e.type === 'touchstart') {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else {
      startX = e.clientX;
      startY = e.clientY;
    }
    
    // Add dragging class
    element.classList.add('dragging');
    
    // Show drag ghost
    const ghost = document.getElementById('drag-ghost');
    ghost.querySelector('.drag-text').textContent = dragData.text;
    ghost.style.display = 'block';
    
    // Add global event listeners
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  }
  
  function handleDragMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    let clientX, clientY;
    
    if (e.type === 'touchmove') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Move ghost element
    const ghost = document.getElementById('drag-ghost');
    ghost.style.left = clientX + 'px';
    ghost.style.top = clientY + 'px';
    
    // Check for drop targets
    const elements = document.elementsFromPoint(clientX, clientY);
    const dropTarget = elements.find(el => el.classList.contains('drop-target'));
    
    // Update drop target styles
    document.querySelectorAll('.drop-target').forEach(target => {
      target.classList.remove('drop-hover');
    });
    
    if (dropTarget) {
      dropTarget.classList.add('drop-hover');
    }
  }
  
 function handleDragEnd(e) {
  if (!isDragging) return;
  
  isDragging = false;
  
  // Remove dragging class
  element.classList.remove('dragging');
  
  // Hide drag ghost
  const ghost = document.getElementById('drag-ghost');
  ghost.style.display = 'none';
  
  // Get drop position
  let clientX, clientY;
  
  if (e.type === 'touchend') {
    if (!e.changedTouches[0]) return;
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  
  // Find drop target
  const elements = document.elementsFromPoint(clientX, clientY);
  const dropTarget = elements.find(el => el.classList.contains('drop-target'));
  
  // Reset all drop targets
  document.querySelectorAll('.drop-target').forEach(target => {
    target.classList.remove('drop-hover', 'drop-success');
  });
  
  // Handle drop
  if (dropTarget && dragData) {
    const field = dropTarget.dataset.dropField;
    const input = dropTarget;
    
    // Animate success
    dropTarget.classList.add('drop-success');
    setTimeout(() => {
      dropTarget.classList.remove('drop-success');
    }, 500);
    
    // Update input value
    input.value = dragData.text;
    
    // Trigger input event to update styles and hide placeholder
    const inputEvent = new Event('input', { bubbles: true });
    input.dispatchEvent(inputEvent);
    
    // Also trigger change event for good measure
    const changeEvent = new Event('change', { bubbles: true });
    input.dispatchEvent(changeEvent);
    
    updateInputStyle(input);
    
    // Save data
    if (field === 'origin') {
      saveRouteData(input.value, destInput.value, type);
    } else if (field === 'destination') {
      saveRouteData(originInput.value, input.value, type);
    }
    
    // Focus the input
    input.focus();
    
    // Show success feedback
    showToast(`"${dragData.text}" به ${field === 'origin' ? 'مبدأ' : 'مقصد'} اضافه شد`, 'success');
  }
  
  // Cleanup
  dragData = null;
  
  // Remove global event listeners
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
  document.removeEventListener('touchmove', handleDragMove);
  document.removeEventListener('touchend', handleDragEnd);
}
}

function makeDroppable(inputElement, field, type) {
  if (!inputElement) return;
  
  // Add drop target class and data attribute
  inputElement.classList.add('drop-target');
  inputElement.dataset.dropField = field;
  inputElement.dataset.dropType = type;
  
  // Check if placeholder already exists
  let placeholder = inputElement.parentElement.querySelector('.drop-placeholder');
  
  // Create placeholder if it doesn't exist
  if (!placeholder && inputElement.type === 'text') {
    placeholder = document.createElement('div');
    placeholder.className = 'drop-placeholder';
    placeholder.innerHTML = `
      <span class="material-symbols-outlined" style="color: #94a3b8; margin-left: 8px;">
        ${field === 'origin' ? 'flight_takeoff' : 'flight_land'}
      </span>
      <span style="color: #94a3b8; font-size: 14px;">
        ${field === 'origin' ? 'مبدأ را اینجا رها کنید' : 'مقصد را اینجا رها کنید'}
      </span>
    `;
    
    // Style the placeholder
    placeholder.style.cssText = `
      position: absolute;
      top: 50%;
      right: 16px;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      gap: 4px;
      pointer-events: none;
      opacity: 0.6;
      z-index: 5;
      transition: opacity 0.3s ease;
    `;
    
    // Make sure parent has relative positioning
    if (window.getComputedStyle(inputElement.parentElement).position === 'static') {
      inputElement.parentElement.style.position = 'relative';
    }
    
    inputElement.parentElement.appendChild(placeholder);
  }
  
  // Update placeholder visibility based on input value
  const updatePlaceholder = () => {
  if (placeholder) {
    if (inputElement.value.trim()) {
      placeholder.style.opacity = '0';
      // Use timeout for smooth transition
      setTimeout(() => {
        if (inputElement.value.trim()) {
          placeholder.style.display = 'none';
        }
      }, 300);
    } else {
      placeholder.style.display = 'flex';
      placeholder.style.opacity = '0.6';
    }
  }
};
  
  // Initialize visibility
  updatePlaceholder();
  
  // Update on input and drag events
  inputElement.addEventListener('input', updatePlaceholder);
  inputElement.addEventListener('change', updatePlaceholder);
  
  // Also update when element gets focus/blur
  inputElement.addEventListener('focus', () => {
    if (placeholder && !inputElement.value.trim()) {
      placeholder.style.opacity = '0.3';
    }
  });
  
  inputElement.addEventListener('blur', updatePlaceholder);
}
// Export utility functions (if needed elsewhere)
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
// ===================== HELPER FUNCTIONS =====================
function updatePlaceholderVisibility(inputElement) {
  const parent = inputElement.closest('.group');
  if (!parent) return;
  
  const placeholder = parent.querySelector('.drop-placeholder');
  if (!placeholder) return;
  
  if (inputElement.value.trim()) {
    placeholder.style.opacity = '0';
    placeholder.style.display = 'none';
  } else {
    placeholder.style.display = 'flex';
    placeholder.style.opacity = '0.6';
  }
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

// Helper function to show input selector (when both inputs are filled)
function showInputSelector(originInput, destInput, value, type) {
  // Create a beautiful modal
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4';
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl input-selector-modal">
      <div class="text-center mb-6">
        <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">flight_takeoff</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">انتخاب فیلد</h3>
        <p class="text-slate-600 dark:text-slate-300 text-sm">
          "${value}"
        </p>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">را برای کدام فیلد می‌خواهید؟</p>
      </div>
      
      <div class="space-y-3">
        <button class="input-selector-option w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-right"
                data-field="origin">
          <div class="flex items-center justify-between">
            <span class="material-symbols-outlined text-blue-500">arrow_right_alt</span>
            <div class="text-right flex-1 mr-3">
              <div class="font-medium text-slate-900 dark:text-white">مبدأ (خروج)</div>
              <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">${originInput.value || 'خالی'}</div>
            </div>
          </div>
        </button>
        
        <button class="input-selector-option w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-right"
                data-field="destination">
          <div class="flex items-center justify-between">
            <span class="material-symbols-outlined text-emerald-500">arrow_right_alt</span>
            <div class="text-right flex-1 mr-3">
              <div class="font-medium text-slate-900 dark:text-white">مقصد (ورود)</div>
              <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">${destInput.value || 'خالی'}</div>
            </div>
          </div>
        </button>
      </div>
      
      <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
        <button class="input-selector-cancel w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-colors">
          انصراف
        </button>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Handle option selection
  modal.querySelectorAll('.input-selector-option').forEach(option => {
    option.addEventListener('click', function() {
      const field = this.dataset.field;
      
      if (field === 'origin') {
        originInput.value = value;
        originInput.focus();
      } else if (field === 'destination') {
        destInput.value = value;
        destInput.focus();
      }
      
      updateInputStyle(originInput);
      updateInputStyle(destInput);
      saveRouteData(originInput.value, destInput.value, type);
      
      modal.remove();
      document.body.style.overflow = '';
    });
  });

  // Handle cancel button
  modal.querySelector('.input-selector-cancel').addEventListener('click', () => {
    modal.remove();
    document.body.style.overflow = '';
  });

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  });

  // Close with Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// ... rest of your existing utility functions (setupInputHandlers, saveRouteData, etc.)
// Keep all the other functions exactly as you have them