// DOM utility functions

export function hideAppLoader() {
    console.log('🎯 hideAppLoader called');
    
    const loader = document.getElementById("app-loader");
    if (!loader) {
        console.warn('⚠️ No app-loader element found');
        return;
    }
    
    console.log('👁️ Hiding loader element');
    
    // Add hidden class
    loader.classList.add("app-loader--hidden");
    
    // Remove from DOM after animation
    setTimeout(() => {
        if (loader && loader.parentNode) {
            console.log('🗑️ Removing loader from DOM');
            loader.remove();
        }
    }, 300);
}

// Alternative: Force remove loader with fallback
export function forceRemoveLoader() {
    console.log('⚡ Force removing loader');
    
    const loader = document.getElementById("app-loader");
    if (loader) {
        loader.style.display = 'none';
        if (loader.parentNode) {
            loader.remove();
        }
    }
    
    // Also remove any overlay
    const overlays = document.querySelectorAll('.loader-overlay, .loading-screen');
    overlays.forEach(el => {
        el.style.display = 'none';
        if (el.parentNode) el.remove();
    });
    
    // Ensure body is visible
    document.body.style.overflow = 'auto';
}

export function showLoader() {
    const loader = document.getElementById("app-loader");
    if (loader) {
        loader.classList.remove("app-loader--hidden");
    }
}

export function createRouteProgress() {
    const el = document.getElementById("route-progress");
    if (!el) return () => { };

    let timerId = null;
    return () => {
        if (timerId) clearTimeout(timerId);
        el.classList.remove("is-active");
        void el.offsetWidth;
        el.classList.add("is-active");
        timerId = setTimeout(() => el.classList.remove("is-active"), 280);
    };
}

export function createElement(tag, attributes = {}, children = null) {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;  // This is correct
        } else if (key.startsWith('data-')) {
            element.setAttribute(key, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (value !== null && value !== undefined) {
            element.setAttribute(key, value);
        }
    });

    if (Array.isArray(children)) {
        children.forEach(child => {
            if (typeof child === 'string') {
                // FIX THIS LINE: Use innerHTML for strings with HTML
                if (child.includes('<')) {
                    element.innerHTML += child;
                } else {
                    element.appendChild(document.createTextNode(child));
                }
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
    } else if (typeof children === 'string') {
        // FIX THIS LINE: Check if string contains HTML
        if (children.includes('<')) {
            element.innerHTML = children;
        } else {
            element.textContent = children;
        }
    } else if (children instanceof Node) {
        element.appendChild(children);
    }

    return element;
}

export function delegateEvent(parent, eventType, selector, handler) {
    parent.addEventListener(eventType, (event) => {
        if (event.target.matches(selector)) {
            handler(event);
        }
    });
}

export function toggleElement(el, show) {
    if (show) {
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

export function getPageElement(pageName) {
    return document.querySelector(`[data-page="${pageName}"]`);
}

// Check if loader CSS exists
export function checkLoaderStyles() {
    const loader = document.getElementById("app-loader");
    if (!loader) {
        console.warn('❌ No loader element found in DOM');
        return false;
    }
    
    const styles = window.getComputedStyle(loader);
    console.log('📊 Loader styles:', {
        display: styles.display,
        opacity: styles.opacity,
        visibility: styles.visibility
    });
    
    return true;
}