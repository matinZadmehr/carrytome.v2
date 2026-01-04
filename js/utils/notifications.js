import { createElement } from './dom.js';

let notificationStylesAdded = false;

function addNotificationStyles() {
    if (notificationStylesAdded) return;

    const style = document.createElement('style');
    style.textContent = `
    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes slideUp {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(-100%);
        opacity: 0;
      }
    }
    
    .notification {
      animation: slideDown 0.3s ease-out;
    }
    
    .notification.hiding {
      animation: slideUp 0.3s ease-out;
    }
  `;
    document.head.appendChild(style);
    notificationStylesAdded = true;
}

export function showNotification(message, type = 'info', duration = 3000) {
    addNotificationStyles();

    const typeClasses = {
        success: 'bg-emerald-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-amber-500 text-white',
        info: 'bg-blue-500 text-white'
    };

    const typeIcons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };

    const notification = createElement('div', {
        className: `fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-lg notification ${typeClasses[type] || typeClasses.info}`
    });

    notification.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
        <span class="material-symbols-outlined">${typeIcons[type] || 'info'}</span>
      </div>
      <div class="flex-1">
        <p class="font-medium">${message}</p>
      </div>
      <button class="close-notification text-white/80 hover:text-white">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
  `;

    document.body.appendChild(notification);

    // Close button handler
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });

    // Auto-close
    const timeout = setTimeout(() => {
        closeNotification(notification);
    }, duration);

    // Cleanup function
    notification._cleanup = () => {
        clearTimeout(timeout);
        closeBtn.removeEventListener('click', () => { });
    };

    return notification;
}

export function closeNotification(notification) {
    if (!notification || !notification.parentNode) return;

    notification.classList.add('hiding');
    notification._cleanup?.();

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}