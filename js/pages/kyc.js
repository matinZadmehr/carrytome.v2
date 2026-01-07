import { createElement, delegateEvent } from './dom.js';

const app = document.getElementById('app');

/* --------------------
   STATE
-------------------- */
let docs = [
  {
    id: 'id-card',
    title: 'کارت ملی یا پاسپورت',
    description: 'ارائه یکی از این مدارک کافی است',
    status: 'pending',
  },
  {
    id: 'selfie',
    title: 'عکس سلفی',
    description: 'عکس واضح از چهره خود بگیرید',
    status: 'error',
    errorMessage: 'نور کم',
  },
];

let activeDocId = null;
let showOptions = false;

/* --------------------
   HELPERS
-------------------- */
const completedCount = () =>
  docs.filter(d => d.status === 'completed').length;

const progressPercent = () =>
  Math.max((completedCount() / docs.length) * 100, 5);

const isSubmitEnabled = () =>
  completedCount() === docs.length;

/* --------------------
   ACTIONS
-------------------- */
function handleCardClick(id) {
  const doc = docs.find(d => d.id === id);
  if (!doc || doc.status === 'completed' || doc.status === 'uploading') return;

  activeDocId = id;
  showOptions = true;
  render();
}

function processUpload() {
  if (!activeDocId) return;

  showOptions = false;
  docs = docs.map(d =>
    d.id === activeDocId ? { ...d, status: 'uploading' } : d
  );
  render();

  setTimeout(() => {
    docs = docs.map(d =>
      d.id === activeDocId
        ? { ...d, status: 'completed', errorMessage: undefined }
        : d
    );
    activeDocId = null;
    render();
  }, 2000);
}

/* --------------------
   RENDER HELPERS
-------------------- */
function renderStatus(doc) {
  if (doc.status === 'error') {
    return createElement('div', {
      className: 'text-orange-600 text-xs mt-1',
      textContent: `نیاز به اصلاح: ${doc.errorMessage}`,
    });
  }
  if (doc.status === 'completed') {
    return createElement('div', {
      className: 'text-emerald-600 text-xs mt-1',
      textContent: 'تأیید شده',
    });
  }
  if (doc.status === 'uploading') {
    return createElement('div', {
      className: 'text-blue-500 text-xs mt-1',
      textContent: 'در حال بارگذاری...',
    });
  }
  return null;
}

function renderIcon(status) {
  const map = {
    completed: 'check-circle-2',
    error: 'refresh-ccw',
    uploading: 'loader-2',
    pending: 'camera',
  };

  return createElement('i', {
    'data-lucide': map[status] || 'camera',
    className: status === 'uploading' ? 'animate-spin' : '',
  });
}

/* --------------------
   MAIN RENDER
-------------------- */
function render() {
  app.innerHTML = '';

  const root = createElement('div', {
    className: 'max-w-md mx-auto min-h-screen flex flex-col pb-32 relative',
  });

  /* HEADER */
  root.appendChild(
    createElement('header', {
      className:
        'flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-10',
      children: [
        createElement('div', {
          className: 'flex-1 text-center',
          children: [
            createElement('h1', {
              className: 'text-lg font-bold',
              textContent: 'تأیید هویت (KYV) حامل',
            }),
          ],
        }),
        createElement('i', { 'data-lucide': 'help-circle' }),
      ],
    })
  );

  /* HERO */
  root.appendChild(
    createElement('section', {
      className: 'flex flex-col items-center pt-10 px-6 pb-6 text-center',
      children: [
        createElement('div', {
          className:
            'w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6',
          children: [
            createElement('i', {
              'data-lucide': 'shield-check',
              className: 'text-blue-500',
            }),
          ],
        }),
        createElement('h2', {
          className: 'text-2xl font-black mb-3',
          textContent: 'احراز هویت امن',
        }),
        createElement('p', {
          className: 'text-sm text-slate-400 max-w-[280px]',
          textContent:
            'مدارک شما با بالاترین استانداردهای امنیتی رمزگذاری شده است',
        }),
      ],
    })
  );

  /* PROGRESS */
  root.appendChild(
    createElement('section', {
      className: 'px-6 mb-8',
      children: [
        createElement('div', {
          className: 'flex justify-between mb-2',
          children: [
            createElement('span', {
              className: 'text-sm font-bold',
              textContent: 'پیشرفت تأیید',
            }),
            createElement('span', {
              className:
                'text-xs font-bold bg-blue-50 px-2.5 py-1 rounded-full',
              textContent: `${completedCount()} از ${docs.length} مدرک`,
            }),
          ],
        }),
        createElement('div', {
          className: 'h-2.5 bg-slate-100 rounded-full',
          children: [
            createElement('div', {
              className:
                'h-full bg-blue-600 rounded-full transition-all',
              style: `width:${progressPercent()}%`,
            }),
          ],
        }),
      ],
    })
  );

  /* DOC LIST */
  const docsSection = createElement('section', {
    className: 'px-6 space-y-4',
  });

  docs.forEach(doc => {
    const card = createElement('button', {
      className: `
        w-full flex justify-between p-4 rounded-2xl border text-right
        ${doc.status === 'error' ? 'border-orange-200' : 'border-slate-100'}
        ${doc.status === 'completed' ? 'border-emerald-200 opacity-90' : ''}
      `,
      'data-doc-id': doc.id,
      children: [
        createElement('div', {
          children: [
            createElement('div', {
              className: 'font-bold',
              textContent: doc.title,
            }),
            createElement('div', {
              className: 'text-xs text-slate-400',
              textContent: doc.description || '',
            }),
            renderStatus(doc),
          ].filter(Boolean),
        }),
        createElement('div', {
          className:
            'w-10 h-10 rounded-full flex items-center justify-center bg-slate-50',
          children: [renderIcon(doc.status)],
        }),
      ],
    });

    docsSection.appendChild(card);
  });

  root.appendChild(docsSection);

  /* SUBMIT */
  root.appendChild(
    createElement('div', {
      className:
        'fixed bottom-0 left-0 right-0 bg-white p-6 border-t',
      children: [
        createElement('button', {
          className: `
            w-full py-4 rounded-2xl font-bold
            ${
              isSubmitEnabled()
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-400'
            }
          `,
          disabled: !isSubmitEnabled(),
          textContent: 'ارسال برای بررسی',
        }),
      ],
    })
  );

  /* OPTIONS MODAL */
  if (showOptions) {
    root.appendChild(renderOptions());
  }

  app.appendChild(root);
  lucide.createIcons();
}

/* --------------------
   OPTIONS MODAL
-------------------- */
function renderOptions() {
  return createElement('div', {
    className: 'fixed inset-0 bg-black/40 flex items-end z-50',
    children: [
      createElement('div', {
        className:
          'bg-white w-full max-w-md mx-auto rounded-t-3xl p-6',
        children: [
          createElement('h4', {
            className: 'text-lg font-black mb-6',
            textContent: 'انتخاب روش بارگذاری',
          }),
          createElement('button', {
            className: 'w-full p-4 bg-slate-50 rounded-2xl mb-3',
            textContent: 'گرفتن عکس جدید',
            onClick: processUpload,
          }),
          createElement('button', {
            className: 'w-full p-4 bg-slate-50 rounded-2xl',
            textContent: 'انتخاب از گالری',
            onClick: processUpload,
          }),
          createElement('button', {
            className: 'w-full mt-6 text-slate-400',
            textContent: 'انصراف',
            onClick: () => {
              showOptions = false;
              render();
            },
          }),
        ],
      }),
    ],
  });
}

/* --------------------
   EVENTS
-------------------- */
delegateEvent(app, 'click', '[data-doc-id]', e => {
  handleCardClick(e.currentTarget.dataset.docId);
});

/* --------------------
   INIT
-------------------- */
render();
