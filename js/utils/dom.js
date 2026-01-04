// DOM utility functions

export function hideAppLoader() {
    const loader = document.getElementById("app-loader");
    if (!loader) return;
    loader.classList.add("app-loader--hidden");
    setTimeout(() => {
        if (loader.parentNode) {
            loader.remove();
        }
    }, 260);
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
            element.innerHTML = value;
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
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
    } else if (typeof children === 'string') {
        element.textContent = children;
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