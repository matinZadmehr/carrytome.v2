const app = document.getElementById("app");

/* =========================
   STATE
========================= */
let isRegistered = false;

/* =========================
   ACTIONS
========================= */
function handleStartRegistration() {
  console.log("Starting registration process...");
  alert("فرآیند ثبت نام آغاز شد");
}

/* =========================
   COMPONENTS (TEMPLATES)
========================= */

function Header(title) {
  return `
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 py-4">
      <button class="w-10 h-10 flex items-center justify-center rounded-full text-slate-900 hover:bg-gray-100 transition-colors">
        <span class="material-symbols-outlined text-2xl">close</span>
      </button>
      <h1 class="text-lg font-black text-slate-900">${title}</h1>
      <div class="w-10"></div>
    </header>
  `;
}

function Hero(imageUrl, title, badge) {
  return `
    <div class="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-xl shadow-slate-200">
      <img src="${imageUrl}" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
        <div class="flex mb-3">
          <span class="bg-white/20 backdrop-blur-lg text-white border border-white/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            ${badge}
          </span>
        </div>
        <h2 class="text-white text-3xl font-black leading-tight">
          ${title}
        </h2>
      </div>
    </div>
  `;
}

function Step(step, isLast) {
  return `
    <div class="flex gap-6 relative group">
      ${
        !isLast
          ? `<div class="absolute right-[23px] top-10 bottom-0 w-[2px] bg-slate-100"></div>`
          : ""
      }

      <div class="
        relative z-10 w-12 h-12 shrink-0 rounded-full border-2 flex items-center justify-center
        font-black text-xl transition-all duration-300
        ${
          step.isActive
            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110 ring-4 ring-white"
            : "bg-white border-slate-200 text-slate-300"
        }
      ">
        ${step.number}
      </div>

      <div class="pb-8">
        <h4 class="text-lg font-black mb-1 ${
          step.isActive ? "text-slate-900" : "text-slate-500"
        }">
          ${step.title}
        </h4>
        <p class="text-sm text-slate-400 font-medium leading-relaxed">
          ${step.description}
        </p>
      </div>
    </div>
  `;
}

function StepList() {
  const steps = [
    {
      number: 1,
      title: "احراز هویت",
      description: "مدارک هویتی خود را بارگذاری کنید تا پروفایل شما تایید شود.",
      isActive: true,
    },
    {
      number: 2,
      title: "دریافت بسته",
      description: "بسته را در فرودگاه از نماینده ما تحویل بگیرید.",
      isActive: false,
    },
    {
      number: 3,
      title: "تحویل و دریافت پاداش",
      description: "بسته را در مقصد تحویل داده و پاداش خود را آنی دریافت کنید.",
      isActive: false,
    },
  ];

  return `
    <div class="space-y-0 px-2">
      ${steps.map((s, i) => Step(s, i === steps.length - 1)).join("")}
    </div>
  `;
}

function ActionFooter(primaryText, subText) {
  return `
    <div class="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-5 py-6 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex flex-col items-center z-50">
      <button
        onclick="handleStartRegistration()"
        class="w-full h-16 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all
               text-white rounded-full font-black text-xl flex items-center justify-center gap-3
               shadow-xl shadow-blue-100">
        <span class="material-symbols-outlined -scale-x-100 text-2xl">
          arrow_forward
        </span>
        ${primaryText}
      </button>

      <p class="mt-3 text-slate-400 text-[11px] font-bold tracking-tight">
        ${subText}
      </p>
    </div>
  `;
}

/* =========================
   RENDER
========================= */
function render() {
  app.innerHTML = `
    <div class="min-h-screen bg-white max-w-lg mx-auto flex flex-col relative pb-32">
      ${Header("حامل شوید")}

      <main class="flex-1 overflow-y-auto px-5">
        ${Hero(
          "https://picsum.photos/seed/airport/800/600",
          "سفرهای خود را سودآور کنید",
          "عضویت ویژه"
        )}

        <div class="mt-8 text-center px-2">
          <h2 class="text-xl font-black text-slate-900 leading-tight">
            به شبکه حاملان مورد اعتماد Carry to Me بپیوندید
          </h2>
          <p class="mt-3 text-slate-500 text-sm leading-relaxed font-medium">
            هزینه سفر خود را پوشش دهید و به جابجایی امن اقلام با ارزش کمک کنید.
          </p>
        </div>

        <section class="mt-12 mb-8">
          <div class="text-center mb-8">
            <span class="text-blue-600 font-bold text-xs uppercase tracking-widest block mb-1">
              روند کار
            </span>
            <h3 class="text-2xl font-black text-slate-900">
              چگونه کار می‌کند؟
            </h3>
          </div>

          ${StepList()}
        </section>
      </main>

      ${ActionFooter(
        "شروع ثبت نام",
        "ثبت نام رایگان است و کمتر از ۲ دقیقه زمان می‌برد"
      )}
    </div>
  `;
}

/* =========================
   INIT
========================= */
render();
