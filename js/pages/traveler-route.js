/**
 * Traveler Route Page Initialization
 * Handles route selection for traveler flights
 */
export function initTravelerRoute() {
    console.log('Initializing traveler-route page...');

    const pageElement = document.getElementById('page-traveler-route');
    if (!pageElement) {
        console.error('Traveler route page element not found');
        return;
    }

    // DOM Elements
    const originInput = pageElement.querySelector('#origin-input') ||
        pageElement.querySelector('input[data-role="origin"]') ||
        pageElement.querySelector('input[placeholder*="مبدأ پرواز"]');

    const destinationInput = pageElement.querySelector('#dest-input') ||
        pageElement.querySelector('input[data-role="destination"]') ||
        pageElement.querySelector('input[placeholder*="مقصد پرواز"]');

    const swapButton = pageElement.querySelector('#swap-button') ||
        pageElement.querySelector('button[data-action="swap"]') ||
        pageElement.querySelector('button[type="button"] .material-symbols-outlined[class*="swap_vert"]')?.closest('button');

    const popularRoutes = pageElement.querySelectorAll('.popular-route-btn, #popular-routes button');
    const suggestionItems = pageElement.querySelectorAll('.airport-suggestion');
    const submitButton = pageElement.querySelector('#submit-route') ||
        pageElement.querySelector('button[data-route="traveler-flight-date"]');

    const backButton = pageElement.querySelector('header button[data-href="#"]');

    // State
    let routeData = {
        origin: '',
        destination: '',
        timestamp: null,
        type: 'traveler'
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

        // Submit button
        if (submitButton) {
            submitButton.addEventListener('click', handleSubmit);
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
            originInput.addEventListener('keydown', handleInputKeydown);
        }

        if (destinationInput) {
            destinationInput.addEventListener('input', handleInputChange);
            destinationInput.addEventListener('focus', handleInputFocus);
            destinationInput.addEventListener('blur', handleInputBlur);
            destinationInput.addEventListener('keydown', handleInputKeydown);
        }

        // Initialize submit button state
        updateSubmitButtonState();
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
        updateSubmitButtonState();
        saveRouteData();
    }

    function handlePopularRoute(button) {
        try {
            // Try to get data from attributes first
            let origin = button.dataset.origin;
            let destination = button.dataset.destination;

            // If not in dataset, extract from text content
            if (!origin || !destination) {
                const spans = button.querySelectorAll('span:not(.material-symbols-outlined)');
                if (spans.length >= 2) {
                    origin = spans[0].textContent.trim();
                    destination = spans[spans.length - 1].textContent.trim();
                }
            }

            if (origin && destination) {
                // Update inputs
                originInput.value = origin.trim();
                destinationInput.value = destination.trim();

                // Update state
                routeData.origin = origin.trim();
                routeData.destination = destination.trim();
                routeData.timestamp = new Date().toISOString();

                // Update UI
                updateInputStates();
                updateSubmitButtonState();
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

        // Get airport code if available
        const code = item.dataset.code || '';
        const airportName = item.dataset.airport || '';

        // Use airport name if available, otherwise use title
        const displayText = airportName && code ? `${airportName} (${code})` : title;

        // Determine which input to fill based on focus
        if (document.activeElement === originInput) {
            originInput.value = displayText;
            routeData.origin = displayText;
        } else if (document.activeElement === destinationInput) {
            destinationInput.value = displayText;
            routeData.destination = displayText;
        } else {
            // If no input is focused, use smart selection
            if (!originInput.value.trim()) {
                originInput.value = displayText;
                routeData.origin = displayText;
                originInput.focus();
            } else if (!destinationInput.value.trim()) {
                destinationInput.value = displayText;
                routeData.destination = displayText;
                destinationInput.focus();
            } else {
                // Both inputs have values - show selection dialog
                showSelectionDialog(displayText);
            }
        }

        // Update state
        routeData.timestamp = new Date().toISOString();

        // Update UI and save
        updateInputStates();
        updateSubmitButtonState();
        saveRouteData();
    }

    function showSelectionDialog(displayText) {
        // Simple prompt for now - you can replace with a custom modal
        const choice = confirm(`"${displayText}" را به عنوان مبدأ انتخاب کنم؟\n\nOK: مبدأ\nCancel: مقصد`);

        if (choice === true) {
            originInput.value = displayText;
            routeData.origin = displayText;
            originInput.focus();
        } else {
            destinationInput.value = displayText;
            routeData.destination = displayText;
            destinationInput.focus();
        }
    }

    function handleSubmit() {
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

        // Add loading state to button
        if (submitButton) {
            const originalText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="flex items-center justify-center gap-2">
                    <span class="animate-spin material-symbols-outlined text-[20px]">refresh</span>
                    <span>در حال انتقال...</span>
                </span>
            `;

            // Navigate to next page after a short delay
            setTimeout(() => {
                navigateToRoute('traveler-flight-date');
                // Restore button state (in case navigation fails)
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }, 800);
        } else {
            navigateToRoute('traveler-flight-date');
        }
    }

    function handleBack() {
        // Save current state before leaving
        saveRouteData();

        // Navigate back (you can adjust this based on your routing)
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Fallback to a specific route if no history
            navigateToRoute('home');
        }
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
        updateSubmitButtonState();

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

    function handleInputKeydown(event) {
        // Enter key to submit if both inputs are filled
        if (event.key === 'Enter' && submitButton && !submitButton.disabled) {
            event.preventDefault();
            submitButton.click();
        }
    }

    // Utility Functions
    function validateRoute() {
        const origin = originInput.value.trim();
        const destination = destinationInput.value.trim();

        if (!origin || !destination) {
            showValidationError('لطفاً هم مبدأ و هم مقصد را وارد کنید');
            if (!origin) {
                originInput.focus();
            } else {
                destinationInput.focus();
            }
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
        // Create a toast notification instead of alert
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);

        // Add visual error state to inputs
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

    function updateInputStates() {
        if (originInput) updateInputState(originInput);
        if (destinationInput) updateInputState(destinationInput);
    }

    function updateSubmitButtonState() {
        if (submitButton) {
            const isValid = validateRoute(false); // Don't show alerts
            submitButton.disabled = !isValid;
        }
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
            localStorage.setItem('travelerRoute', JSON.stringify(data));

            // Also save to session storage for current session
            sessionStorage.setItem('currentTravelerRoute', JSON.stringify(data));

            console.log('Traveler route data saved:', data);
        } catch (error) {
            console.error('Error saving traveler route data:', error);
        }
    }

    function loadSavedRoute() {
        try {
            // Try to load from session storage first (more recent)
            let savedData = sessionStorage.getItem('currentTravelerRoute');

            if (!savedData) {
                // Fall back to localStorage
                savedData = localStorage.getItem('travelerRoute');
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
                updateSubmitButtonState();

                console.log('Loaded saved traveler route:', routeData);
            }
        } catch (error) {
            console.error('Error loading saved traveler route:', error);
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

    // Validate without showing alerts (for button state)
    function validateRoute(silent = true) {
        const origin = originInput.value.trim();
        const destination = destinationInput.value.trim();

        if (!origin || !destination) {
            return false;
        }

        if (origin === destination) {
            return false;
        }

        if (origin.length < 2 || destination.length < 2) {
            return false;
        }

        return true;
    }

    // Cleanup function (for router to call when leaving page)
    function cleanup() {
        console.log('Cleaning up traveler-route page...');

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

        if (submitButton) submitButton.removeEventListener('click', handleSubmit);
        if (backButton) backButton.removeEventListener('click', handleBack);

        if (originInput) {
            originInput.removeEventListener('input', handleInputChange);
            originInput.removeEventListener('focus', handleInputFocus);
            originInput.removeEventListener('blur', handleInputBlur);
            originInput.removeEventListener('keydown', handleInputKeydown);
        }

        if (destinationInput) {
            destinationInput.removeEventListener('input', handleInputChange);
            destinationInput.removeEventListener('focus', handleInputFocus);
            destinationInput.removeEventListener('blur', handleInputBlur);
            destinationInput.removeEventListener('keydown', handleInputKeydown);
        }

        clearTimeout(saveTimeout);
    }

    // Initialize page
    setupEventListeners();

    // Return cleanup function for router
    return cleanup;
}

// Optional: Add utility function for other components to access traveler route data
export function getCurrentTravelerRoute() {
    try {
        const saved = localStorage.getItem('travelerRoute');
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Error getting current traveler route:', error);
        return null;
    }
}

// Optional: Clear traveler route data
export function clearTravelerRouteData() {
    localStorage.removeItem('travelerRoute');
    sessionStorage.removeItem('currentTravelerRoute');
    console.log('Traveler route data cleared');
}