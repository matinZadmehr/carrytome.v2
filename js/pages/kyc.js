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
function completedCount() {
  return docs.filter(d => d.status === 'completed').length;
}

function progressPercent() {
  return Math.max((completedCount() / docs.length) * 100, 5);
}

function isSubmitEnabled() {
  return completedCount() === docs.length;
}

/* --------------------
   ACTIONS
-------------------- */
function handleCardClick(id) {
  const doc = docs.find(d => d.id === id);
  if (doc.status === 'completed' || doc.status === 'uploading') return;
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
   RENDER
-------------------- */
function render() {
  app.innerHTML = `
  <div class="max-w-md mx-auto min-h-screen flex flex-col pb-32 relative">

    <!-- HEADER -->
    <header class="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-10">
      <div class="flex-1 text-center">
        <h1 class="text-lg font-bold">تأیید هویت (KYV) حامل</h1>
      </div>
      <i data-lucide="help-circle"></i>
    </header>

    <!-- HERO -->
    <section class="flex flex-col items-center pt-10 px-6 pb-6 text-center">
      <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <i data-lucide="shield-check" class="text-blue-500"></i>
      </div>
      <h2 class="text-2xl font-black mb-3">احراز هویت امن</h2>
      <p class="text-sm text-slate-400 max-w-[280px]">
        مدارک شما با بالاترین استانداردهای امنیتی رمزگذاری شده است
      </p>
    </section>

    <!-- PROGRESS -->
    <section class="px-6 mb-8">
      <div class="flex justify-between mb-2">
        <span class="text-sm font-bold">پیشرفت تأیید</span>
        <span class="text-xs font-bold bg-blue-50 px-2.5 py-1 rounded-full">
          ${completedCount()} از ${docs.length} مدرک
        </span>
      </div>
      <div class="h-2.5 bg-slate-100 rounded-full">
        <div class="h-full bg-blue-600 rounded-full transition-all"
             style="width:${progressPercent()}%"></div>
      </div>
    </section>

    <!-- DOCS -->
    <section class="px-6 space-y-4">
      ${docs.map(doc => `
        <button
          onclick="handleCardClick('${doc.id}')"
          class="w-full flex justify-between p-4 rounded-2xl border text-right
            ${doc.status === 'error' ? 'border-orange-200' : 'border-slate-100'}
            ${doc.status === 'completed' ? 'border-emerald-200 opacity-90' : ''}
          ">
          <div>
            <div class="font-bold">${doc.title}</div>
            <div class="text-xs text-slate-400">${doc.description || ''}</div>
            ${renderStatus(doc)}
          </div>
          <div class="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50">
            ${renderIcon(doc.status)}
          </div>
        </button>
      `).join('')}
    </section>

    <!-- SUBMIT -->
    <div class="fixed bottom-0 left-0 right-0 bg-white p-6 border-t">
      <button
        ${isSubmitEnabled() ? '' : 'disabled'}
        class="w-full py-4 rounded-2xl font-bold
          ${isSubmitEnabled() ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}">
        ارسال برای بررسی
      </button>
    </div>

    ${renderOptions()}
  </div>
  `;

  lucide.createIcons();
}

/* --------------------
   PARTIAL RENDERS
-------------------- */
function renderStatus(doc) {
  if (doc.status === 'error') {
    return `<div class="text-orange-600 text-xs mt-1">نیاز به اصلاح: ${doc.errorMessage}</div>`;
  }
  if (doc.status === 'completed') {
    return `<div class="text-emerald-600 text-xs mt-1">تأیید شده</div>`;
  }
  if (doc.status === 'uploading') {
    return `<div class="text-blue-500 text-xs mt-1">در حال بارگذاری...</div>`;
  }
  return '';
}

function renderIcon(status) {
  if (status === 'completed') return '<i data-lucide="check-circle-2"></i>';
  if (status === 'error') return '<i data-lucide="refresh-ccw"></i>';
  if (status === 'uploading') return '<i data-lucide="loader-2" class="animate-spin"></i>';
  return '<i data-lucide="camera"></i>';
}

function renderOptions() {
  if (!showOptions) return '';

  return `
  <div class="fixed inset-0 bg-black/40 flex items-end z-50">
    <div class="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6">
      <h4 class="text-lg font-black mb-6">انتخاب روش بارگذاری</h4>
      <button onclick="processUpload()" class="w-full p-4 bg-slate-50 rounded-2xl mb-3">
        گرفتن عکس جدید
      </button>
      <button onclick="processUpload()" class="w-full p-4 bg-slate-50 rounded-2xl">
        انتخاب از گالری
      </button>
      <button onclick="showOptions=false;render()" class="w-full mt-6 text-slate-400">
        انصراف
      </button>
    </div>
  </div>
  `;
}

/* --------------------
   INIT
-------------------- */
render();
