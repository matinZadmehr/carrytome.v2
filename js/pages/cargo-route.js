/**
 * Cargo Route Page Initialization
 * Handles route selection for cargo shipping
 */
export function initCargoRoute() {
    console.log('Initializing cargo-route page...');

    const pageElement = document.getElementById('page-cargo-route');
    if (!pageElement) {
        console.error('Cargo route page element not found');
        return;
    }

    // DOM Elements
    const originInput = pageElement.querySelector('input[placeholder*="مبدأ"]');
    const destinationInput = pageElement.querySelector('input[placeholder*="مقصد"]');
    const swapButton = pageElement.querySelector('button[type="button"] .material-symbols-outlined[class*="swap_vert"]')?.closest('button');
    const popularRoutes = pageElement.querySelectorAll('.flex-wrap button');
    const suggestionItems = pageElement.querySelectorAll('.cursor-pointer');
    const confirmButton = pageElement.querySelector('button[data-route="registered-cargo"]');
    const backButton = pageElement.querySelector('button[data-route="cargo-pic"]');

    // State
    let routeData = {
        origin: '',
        destination: '',
        timestamp: null
    };

    // Load saved data if exists
    loadSavedRoute();

    // Event Listeners
    function setupEventListeners() {
        // Swap origin and destination
        if (swapButton) {
            swapButton.addEventListener('click', handleSwap);
        }

        // Popular routes
        if (popularRoutes.length > 0) {
            popularRoutes.forEach(button => {
                button.addEventListener('click', () => handlePopularRoute(button));
            });
        }

        // Suggestion items
        if (suggestionItems.length > 0) {
            suggestionItems.forEach(item => {
                item.addEventListener('click', () => handleSuggestionClick(item));
            });
        }

        // Confirm button
        if (confirmButton) {
            confirmButton.addEventListener('click', handleConfirm);
        }

        // Back button
        if (backButton) {
            backButton.addEventListener('click', handleBack);
        }

        // Input events
        if (originInput) {
            originInput.addEventListener('input', handleInputChange);
            originInput.addEventListener('focus', handleInputFocus);
            originInput.addEventListener('blur', handleInputBlur);
        }

        if (destinationInput) {
            destinationInput.addEventListener('input', handleInputChange);
            destinationInput.addEventListener('focus', handleInputFocus);
            destinationInput.addEventListener('blur', handleInputBlur);
        }
    }

    // Event Handlers
    function handleSwap() {
        const originValue = originInput.value;
        const destinationValue = destinationInput.value;

        // Swap values
        originInput.value = destinationValue;
        destinationInput.value = originValue;

        // Update state
        routeData.origin = destinationValue;
        routeData.destination = originValue;

        // Update UI
        updateInputStates();
        saveRouteData();
    }

    function handlePopularRoute(button) {
        try {
            const text = button.textContent.trim();

            // Extract origin and destination from button text
            // Assuming format: "Origin → Destination" (or arrow in opposite direction for RTL)
            const spans = button.querySelectorAll('span:not(.material-symbols-outlined)');

            if (spans.length >= 2) {
                const origin = spans[0].textContent.trim();
                const destination = spans[spans.length - 1].textContent.trim();

                // Update inputs
                originInput.value = origin;
                destinationInput.value = destination;

                // Update state
                routeData.origin = origin;
                routeData.destination = destination;
                routeData.timestamp = new Date().toISOString();

                // Update UI
                updateInputStates();
                saveRouteData();

                console.log('Selected popular route:', { origin, destination });
            }
        } catch (error) {
            console.error('Error handling popular route:', error);
        }
    }

    function handleSuggestionClick(item) {
        const title = item.querySelector('.text-sm.font-bold')?.textContent.trim();
        if (!title) return;

        const description = item.querySelector('.text-xs')?.textContent.trim() || '';

        // Determine which input to fill based on focus
        if (document.activeElement === originInput) {
            originInput.value = title;
            routeData.origin = title;
        } else if (document.activeElement === destinationInput) {
            destinationInput.value = title;
            routeData.destination = title;
        } else {
            // If no input is focused, use smart selection
            if (!originInput.value) {
                originInput.value = title;
                routeData.origin = title;
                originInput.focus();
            } else if (!destinationInput.value) {
                destinationInput.value = title;
                routeData.destination = title;
                destinationInput.focus();
            } else {
                // Both inputs have values, ask user
                // In a real app, you might show a modal or tooltip
                console.log('Both inputs already filled');
            }
        }

        // Update state
        routeData.timestamp = new Date().toISOString();

        // Update UI and save
        updateInputStates();
        saveRouteData();
    }

    function handleConfirm() {
        // Validate inputs
        if (!validateRoute()) {
            return;
        }

        // Update state with current values
        routeData.origin = originInput.value.trim();
        routeData.destination = destinationInput.value.trim();
        routeData.timestamp = new Date().toISOString();

        // Save to localStorage
        saveRouteData();

        // Navigate to next page
        navigateToRoute('registered-cargo');
    }

    function handleBack() {
        // Save current state before leaving
        saveRouteData();

        // Navigate back
        navigateToRoute('cargo-pic');
    }

    function handleInputChange(event) {
        const input = event.target;
        const isOrigin = input === originInput;

        // Update state
        if (isOrigin) {
            routeData.origin = input.value.trim();
        } else {
            routeData.destination = input.value.trim();
        }

        // Update UI
        updateInputState(input);

        // Auto-save after delay
        debounceSave();
    }

    function handleInputFocus(event) {
        const parent = event.target.closest('.group');
        if (parent) {
            parent.classList.add('border-primary/50');
            parent.classList.remove('border-transparent');
        }
    }

    function handleInputBlur(event) {
        const input = event.target;
        updateInputState(input);
    }

    // Utility Functions
    function validateRoute() {
        const origin = originInput.value.trim();
        const destination = destinationInput.value.trim();

        if (!origin || !destination) {
            showValidationError('لطفاً هم مبدأ و هم مقصد را وارد کنید');
            if (!origin) originInput.focus();
            else destinationInput.focus();
            return false;
        }

        if (origin === destination) {
            showValidationError('مبدأ و مقصد نمی‌توانند یکسان باشند');
            return false;
        }

        if (origin.length < 2 || destination.length < 2) {
            showValidationError('نام مبدأ و مقصد باید حداقل ۲ کاراکتر باشد');
            return false;
        }

        return true;
    }

    function showValidationError(message) {
        // Simple alert for now - you can replace with a toast or inline error
        alert(message);

        // Optional: Add visual error state
        const errorClass = 'border-red-500 dark:border-red-400';
        const inputs = [originInput, destinationInput];

        inputs.forEach(input => {
            if (input) {
                const parent = input.closest('.group');
                if (parent) {
                    parent.classList.add(errorClass);
                    setTimeout(() => parent.classList.remove(errorClass), 3000);
                }
            }
        });
    }

    function updateInputState(input) {
        const parent = input.closest('.group');
        if (!parent) return;

        const value = input.value.trim();

        if (value.length > 0) {
            if (value.length < 2) {
                parent.classList.add('border-yellow-500');
                parent.classList.remove('border-primary/50', 'border-transparent');
            } else {
                parent.classList.remove('border-yellow-500');
                parent.classList.add('border-primary/50');
            }
        } else {
            parent.classList.remove('border-yellow-500', 'border-primary/50');
            parent.classList.add('border-transparent');
        }
    }

    function updateInputStates() {
        if (originInput) updateInputState(originInput);
        if (destinationInput) updateInputState(destinationInput);
    }

    function saveRouteData() {
        try {
            // Get all route data
            const data = {
                ...routeData,
                origin: originInput?.value.trim() || '',
                destination: destinationInput?.value.trim() || '',
                savedAt: new Date().toISOString()
            };

            // Save to localStorage
            localStorage.setItem('cargoRoute', JSON.stringify(data));

            // Also save to session storage for current session
            sessionStorage.setItem('currentCargoRoute', JSON.stringify(data));

            console.log('Route data saved:', data);
        } catch (error) {
            console.error('Error saving route data:', error);
        }
    }

    function loadSavedRoute() {
        try {
            // Try to load from session storage first (more recent)
            let savedData = sessionStorage.getItem('currentCargoRoute');

            if (!savedData) {
                // Fall back to localStorage
                savedData = localStorage.getItem('cargoRoute');
            }

            if (savedData) {
                const parsedData = JSON.parse(savedData);

                // Update inputs
                if (originInput && parsedData.origin) {
                    originInput.value = parsedData.origin;
                }

                if (destinationInput && parsedData.destination) {
                    destinationInput.value = parsedData.destination;
                }

                // Update state
                routeData = {
                    ...parsedData,
                    timestamp: parsedData.timestamp || parsedData.savedAt
                };

                // Update UI
                updateInputStates();

                console.log('Loaded saved route:', routeData);
            }
        } catch (error) {
            console.error('Error loading saved route:', error);
        }
    }

    function navigateToRoute(routeName) {
        // Dispatch route change event (compatible with your router)
        const routeChangeEvent = new CustomEvent('routeChange', {
            detail: { route: routeName }
        });
        window.dispatchEvent(routeChangeEvent);
    }

    // Debounce function for auto-saving
    let saveTimeout;
    function debounceSave() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveRouteData();
        }, 1000);
    }

    // Cleanup function (for router to call when leaving page)
    function cleanup() {
        console.log('Cleaning up cargo-route page...');

        // Save data before leaving
        saveRouteData();

        // Remove event listeners
        if (swapButton) swapButton.removeEventListener('click', handleSwap);

        if (popularRoutes.length > 0) {
            popularRoutes.forEach(button => {
                button.removeEventListener('click', () => handlePopularRoute(button));
            });
        }

        if (suggestionItems.length > 0) {
            suggestionItems.forEach(item => {
                item.removeEventListener('click', () => handleSuggestionClick(item));
            });
        }

        if (confirmButton) confirmButton.removeEventListener('click', handleConfirm);
        if (backButton) backButton.removeEventListener('click', handleBack);

        if (originInput) {
            originInput.removeEventListener('input', handleInputChange);
            originInput.removeEventListener('focus', handleInputFocus);
            originInput.removeEventListener('blur', handleInputBlur);
        }

        if (destinationInput) {
            destinationInput.removeEventListener('input', handleInputChange);
            destinationInput.removeEventListener('focus', handleInputFocus);
            destinationInput.removeEventListener('blur', handleInputBlur);
        }

        clearTimeout(saveTimeout);
    }

    // Initialize page
    setupEventListeners();
    updateInputStates();

    // Return cleanup function for router
    return cleanup;
}

// Optional: Add utility function for other components to access route data
export function getCurrentRoute() {
    try {
        const saved = localStorage.getItem('cargoRoute');
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Error getting current route:', error);
        return null;
    }
}

// Optional: Clear route data
export function clearRouteData() {
    localStorage.removeItem('cargoRoute');
    sessionStorage.removeItem('currentCargoRoute');
    console.log('Route data cleared');
}