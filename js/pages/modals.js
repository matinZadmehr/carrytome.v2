import { createElement } from '../utils/dom.js';

export function showOrderDetailsModal(order) {
    if (document.querySelector('.order-details-modal')) return;

    let detailsContent = '';
    if (order.type === 'sender') {
        detailsContent = `
      <p><strong>آیتم:</strong> ${order.details.item}</p>
      <p><strong>وزن:</strong> ${order.details.weight}</p>
      <p><strong>مبلغ:</strong> ${order.details.price}</p>
    `;
    } else {
        detailsContent = `
      <p><strong>ظرفیت:</strong> ${order.details.capacity}</p>
      <p><strong>وضعیت:</strong> ${order.details.status}</p>
      <p><strong>پاداش:</strong> ${order.details.price}</p>
    `;
    }

    const modal = createModal({
        title: 'جزئیات سفارش',
        content: `
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full ${order.iconBg} ${order.iconText} flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px]">${order.icon}</span>
          </div>
          <div>
            <h3 class="font-medium text-slate-900 dark:text-white">${order.from} → ${order.to}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">${order.action} • ${order.date}</p>
          </div>
        </div>
        
        <div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3">
          ${detailsContent}
        </div>
        
        <div class="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-2">وضعیت سفارش:</p>
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-${order.statusColor}-50 dark:bg-${order.statusColor}-900/20 border border-${order.statusColor}-100 dark:border-${order.statusColor}-800/30">
            <span class="text-sm font-medium text-${order.statusColor}-600 dark:text-${order.statusColor}-400">${order.statusText}</span>
          </div>
        </div>
      </div>
    `,
        buttons: [
            { text: 'بستن', class: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600' },
            { text: 'پیگیری', class: 'bg-primary text-white hover:bg-primary/90', action: () => console.log('Track order:', order.id) }
        ]
    });

    modal.classList.add('order-details-modal');
}

export function createModal({ title, content, buttons = [], onClose = null }) {
    const modal = createElement('div', {
        className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
    });

    const modalContent = createElement('div', {
        className: 'bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl'
    });

    const header = createElement('div', {
        className: 'flex items-center justify-between mb-6'
    }, [
        createElement('h2', {
            className: 'text-lg font-bold text-slate-900 dark:text-white',
            textContent: title
        }),
        createElement('button', {
            className: 'close-modal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }, createElement('span', { className: 'material-symbols-outlined', textContent: 'close' }))
    ]);

    const contentDiv = createElement('div', {
        className: 'space-y-4',
        innerHTML: content
    });

    const buttonContainer = createElement('div', {
        className: 'mt-8 flex gap-3'
    });

    buttons.forEach((btn, index) => {
        const button = createElement('button', {
            className: `flex-1 py-3 rounded-xl ${btn.class || ''}`,
            textContent: btn.text
        });

        if (btn.action) {
            button.addEventListener('click', btn.action);
        }

        if (index === 0 && !btn.action) {
            button.addEventListener('click', () => closeModal());
        }

        buttonContainer.appendChild(button);
    });

    modalContent.appendChild(header);
    modalContent.appendChild(contentDiv);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);

    const closeModal = () => {
        modal.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
                onClose?.();
            }
        }, 200);
    };

    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.body.appendChild(modal);

    setTimeout(() => {
        modal.classList.add('opacity-100', 'scale-100');
    }, 10);

    return modal;
}