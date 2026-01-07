import { createElement, delegateEvent } from './dom.js';

/* ===============================
   ROOT
================================ */
const app = document.getElementById('app');

/* ===============================
   STATE
================================ */
let flightNumber = '';
let selectedFile = null;
let isAnalyzing = false;
let message = null; // { text, type }

/* ===============================
   HELPERS
================================ */
function setMessage(text, type) {
  message = text ? { text, type } : null;
  render();
}

function renderMessage() {
  if (!message) return null;

  const color =
    message.type === 'error'
      ? 'bg-red-50 text-red-600 border-red-100'
      : message.type === 'success'
      ? 'bg-green-50 text-green-700 border-green-100'
      : 'bg-blue-50 text-blue-600 border-blue-100';

  return createElement('div', {
    className: `mt-6 p-4 rounded-xl text-sm font-medium border ${color}`,
    textContent: message.text,
  });
}

/* ===============================
   COMPONENTS
================================ */
function Header() {
  return createElement('header', {
    className:
      'sticky top-0 z-10 bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between',
    children: [
      createElement('div', {
        className: 'flex items-center space-x-reverse space-x-3',
        children: [
          createElement('button', {
            className:
              'p-2 hover:bg-gray-100 rounded-full transition-colors',
            innerHTML: `
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            `,
          }),
          createElement('h1', {
            className: 'text-xl font-bold text-gray-800',
            textContent: 'تکمیل جزئیات پرواز',
          }),
        ],
      }),
    ],
  });
}

function FlightInput() {
  return createElement('div', {
    className: 'mt-8',
    children: [
      createElement('label', {
        className:
          'block text-gray-800 font-bold text-lg mb-4',
        textContent: 'شماره پرواز',
      }),
      createElement('div', {
        className: 'relative',
        children: [
          createElement('div', {
            className:
              'absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none',
            innerHTML: `
              <svg class="w-6 h-6 text-gray-400 transform -rotate-45"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            `,
          }),
          createElement('input', {
            id: 'flight-input',
            type: 'text',
            value: flightNumber,
            placeholder: 'مثلا W5-115',
            className:
              'w-full bg-white border border-gray-200 rounded-2xl py-4 pr-12 pl-4 text-xl rtl-input focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm',
          }),
        ],
      }),
      createElement('p', {
        className: 'mt-2 text-gray-400 text-sm',
        textContent:
          'کد شرکت هواپیمایی + شماره پرواز (انگلیسی)',
      }),
    ],
  });
}

function TicketUpload() {
  return createElement('div', {
    className: 'mt-8',
    children: [
      createElement('label', {
        className:
          'block text-gray-800 font-bold text-lg mb-4',
        textContent: 'بلیط پرواز',
      }),
      createElement('div', {
        id: 'ticket-box',
        className: `
          relative cursor-pointer border-2 border-dashed rounded-3xl p-10
          flex flex-col items-center justify-center bg-gray-50/50
          transition-all hover:bg-gray-50
          ${isAnalyzing ? 'border-blue-400 opacity-60' : 'border-gray-300'}
        `,
        children: [
          createElement('input', {
            id: 'file-input',
            type: 'file',
            accept: 'image/*,.pdf',
            className: 'hidden',
          }),
          createElement('div', {
            className:
              'w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4',
            innerHTML: `
              <svg class="w-8 h-8 text-blue-600 ${
                isAnalyzing ? 'animate-bounce' : ''
              }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            `,
          }),
          isAnalyzing
            ? createElement('div', {
                className: 'text-center',
                children: [
                  createElement('p', {
                    className: 'text-blue-600 font-bold',
                    textContent: 'در حال پردازش بلیط...',
                  }),
                  createElement('p', {
                    className:
                      'text-gray-500 text-sm mt-1',
                    textContent:
                      'هوش مصنوعی در حال استخراج اطلاعات است',
                  }),
                ],
              })
            : createElement('div', {
                className: 'text-center',
                children: [
                  createElement('p', {
                    className:
                      'text-gray-800 font-bold text-lg',
                    textContent:
                      'برای انتخاب فایل ضربه بزنید',
                  }),
                  createElement('p', {
                    className:
                      'text-gray-400 text-sm mt-1',
                    textContent:
                      'فرمت‌های مجاز: JPG, PNG, PDF',
                  }),
                  selectedFile &&
                    createElement('div', {
                      className:
                        'mt-3 inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium',
                      textContent: selectedFile.name,
                    }),
                ].filter(Boolean),
              }),
        ],
      }),
    ],
  });
}

function SecurityNotice() {
  return createElement('div', {
    className:
      'mt-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-start gap-4',
    innerHTML: `
      <div class="bg-blue-100 p-2 rounded-xl">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622" />
        </svg>
      </div>
      <div>
        <h4 class="font-bold text-blue-900 mb-1">امنیت اطلاعات شما</h4>
        <p class="text-blue-800/70 text-sm leading-relaxed">
          تصویر بلیط صرفاً جهت احراز هویت شما استفاده شده و کاملاً محفوظ می‌ماند.
        </p>
      </div>
    `,
  });
}

/* ===============================
   MAIN RENDER
================================ */
function render() {
  app.innerHTML = '';

  const root = createElement('div', {
    className:
      'flex flex-col min-h-screen bg-white max-w-lg mx-auto shadow-xl',
  });

  root.appendChild(Header());

  const main = createElement('main', {
    className: 'flex-grow p-6 pb-32',
    children: [
      createElement('section', {
        children: [
          createElement('h2', {
            className:
              'text-3xl font-extrabold text-gray-900 mb-2',
            textContent: 'اطلاعات سفر',
          }),
          createElement('p', {
            className:
              'text-gray-500 leading-relaxed',
            textContent:
              'شماره پرواز و تصویر بلیط خود را وارد کنید.',
          }),
        ],
      }),
      renderMessage(),
      FlightInput(),
      TicketUpload(),
      SecurityNotice(),
    ].filter(Boolean),
  });

  root.appendChild(main);

  root.appendChild(
    createElement('footer', {
      className:
        'fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 max-w-lg mx-auto z-20',
      children: [
        createElement('button', {
          id: 'submit-btn',
          className:
            'w-full bg-[#1D72F2] text-white font-bold py-5 rounded-2xl shadow-lg',
          textContent: 'ثبت و ادامه',
        }),
      ],
    })
  );

  app.appendChild(root);
}

/* ===============================
   EVENTS (DELEGATED)
================================ */
delegateEvent(app, 'input', '#flight-input', e => {
  flightNumber = e.target.value;
});

delegateEvent(app, 'click', '#ticket-box', () => {
  document.getElementById('file-input')?.click();
});

delegateEvent(app, 'change', '#file-input', handleFileSelect);

delegateEvent(app, 'click', '#submit-btn', () => {
  if (!flightNumber) {
    setMessage('لطفا شماره پرواز را وارد کنید.', 'error');
    return;
  }
  alert(`تایید شد: ${flightNumber}`);
});

/* ===============================
   FILE HANDLING
================================ */
async function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  selectedFile = file;
  setMessage(null);

  if (!file.type.startsWith('image/')) {
    setMessage('فایل بارگذاری شد.', 'info');
    return;
  }

  isAnalyzing = true;
  render();

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const base64 = reader.result.split(',')[1];
      const result = await analyzeTicket(base64, file.type);

      if (result.success) {
        flightNumber = result.data.flightNumber;
        setMessage(
          `اطلاعات پرواز ${flightNumber} استخراج شد.`,
          'success'
        );
      } else {
        setMessage(result.message || 'خطا در تحلیل', 'error');
      }
    } catch {
      setMessage('خطا در پردازش فایل.', 'error');
    } finally {
      isAnalyzing = false;
      render();
    }
  };

  reader.readAsDataURL(file);
}

/* ===============================
   INIT
================================ */
render();
