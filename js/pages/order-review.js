/* =========================
   Helpers
========================= */
function el(tag, className = "", html = "") {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html) e.innerHTML = html;
  return e;
}

/* =========================
   Header
========================= */
function Header({ onToggleTheme, isDarkMode }) {
  const header = el(
    "header",
    "sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800"
  );

  const left = el("div", "flex items-center gap-3");

  const backBtn = el(
    "button",
    "flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 -mr-2 text-slate-600 dark:text-slate-300"
  );
  backBtn.innerHTML = `<span class="material-symbols-outlined text-[24px]">arrow_forward</span>`;

  const title = el(
    "h1",
    "text-lg font-bold tracking-tight text-slate-900 dark:text-white",
    "مرور و تأیید نهایی"
  );

  left.append(backBtn, title);

  const themeBtn = el(
    "button",
    "flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
  );
  themeBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">${
    isDarkMode ? "light_mode" : "dark_mode"
  }</span>`;

  themeBtn.onclick = onToggleTheme;

  header.append(left, themeBtn);
  return header;
}

/* =========================
   FlightCard
========================= */
function FlightCard(data) {
  const card = el(
    "div",
    "bg-surface-light dark:bg-surface-dark rounded-2xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 relative overflow-hidden"
  );

  card.innerHTML = `
    <div class="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -mr-4 -mt-4"></div>

    <div class="flex items-center justify-between mb-6 relative z-10">
      <div class="flex flex-col items-center gap-1">
        <span class="text-3xl font-black">${data.origin}</span>
        <span class="text-xs text-slate-500">${data.originCity}</span>
      </div>

      <div class="flex-1 flex flex-col items-center px-4">
        <span class="material-symbols-outlined text-primary rotate-180">flight</span>
        <div class="w-full h-[2px] dashed-line"></div>
        <span class="text-[10px] font-bold text-primary bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full mt-2">
          ${data.flightType}
        </span>
      </div>

      <div class="flex flex-col items-center gap-1">
        <span class="text-3xl font-black">${data.destination}</span>
        <span class="text-xs text-slate-500">${data.destinationCity}</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700/50 pt-4">
      <div>
        <span class="text-xs text-slate-400">تاریخ پرواز</span>
        <div class="flex items-center gap-1">
          <span class="material-symbols-outlined">calendar_month</span>
          <span class="font-bold">${data.date}</span>
        </div>
      </div>
      <div>
        <span class="text-xs text-slate-400">ساعت پرواز</span>
        <div class="flex items-center gap-1">
          <span class="material-symbols-outlined">schedule</span>
          <span class="font-bold">${data.time}</span>
        </div>
      </div>
    </div>
  `;

  return card;
}

/* =========================
   StatsGrid
========================= */
function StatsGrid({ baggage, flightNumber }) {
  const grid = el("div", "grid grid-cols-2 gap-4");

  grid.innerHTML = `
    <div class="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border shadow-soft">
      <p class="text-xs text-slate-500">ظرفیت بار خالی</p>
      <p class="text-lg font-black">${baggage}</p>
    </div>
    <div class="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border shadow-soft">
      <p class="text-xs text-slate-500">شماره پرواز</p>
      <p class="text-lg font-black">${flightNumber}</p>
    </div>
  `;
  return grid;
}

/* =========================
   TicketStatus
========================= */
function TicketStatus({ status }) {
  const box = el(
    "div",
    "bg-surface-light dark:bg-surface-dark p-3 rounded-2xl border shadow-soft flex justify-between items-center"
  );

  box.innerHTML = `
    <div>
      <p class="font-bold">تصویر بلیط</p>
      <p class="text-xs text-green-600">${status}</p>
    </div>
    <button class="text-primary text-xs font-bold">مشاهده</button>
  `;
  return box;
}

/* =========================
   RewardBanner
========================= */
function RewardBanner({ amount, currency, basis }) {
  const banner = el(
    "div",
    "bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white flex justify-between"
  );

  banner.innerHTML = `
    <div>
      <p class="text-xs">پاداش برآوردی شما</p>
      <p class="text-[10px] opacity-80">${basis}</p>
    </div>
    <div dir="ltr">
      <span class="text-2xl font-black">${amount}</span>
      <span class="text-sm">${currency}</span>
    </div>
  `;
  return banner;
}

/* =========================
   WarningBox
========================= */
function WarningBox({ message }) {
  const box = el(
    "div",
    "flex gap-2 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl border"
  );

  box.innerHTML = `
    <span class="material-symbols-outlined text-orange-500">info</span>
    <p class="text-[11px] leading-relaxed">${message}</p>
  `;
  return box;
}

/* =========================
   BottomAction
========================= */
function BottomAction({ label, onClick }) {
  const wrap = el(
    "div",
    "sticky bottom-0 bg-background-light dark:bg-background-dark p-4 border-t"
  );

  const btn = el(
    "button",
    "w-full h-14 rounded-xl bg-primary text-white font-bold"
  );
  btn.innerHTML = `${label} <span class="material-symbols-outlined">check_circle</span>`;
  btn.onclick = onClick;

  wrap.appendChild(btn);
  return wrap;
}

/* =========================
   App
========================= */
function initApp() {
  let isDarkMode = false;

  const root = document.getElementById("app");
  root.className = "flex justify-center min-h-screen";

  const app = el(
    "div",
    "relative flex min-h-screen w-full max-w-md flex-col bg-background-light dark:bg-background-dark shadow-2xl"
  );

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle("dark");
    render();
  }

  function render() {
    app.innerHTML = "";

    app.append(
      Header({ onToggleTheme: toggleTheme, isDarkMode }),
      (() => {
        const main = el("main", "flex-1 flex flex-col px-4 py-6 gap-5");
        main.append(
          FlightCard({
            origin: "IKA",
            originCity: "تهران",
            destination: "MCT",
            destinationCity: "مسقط",
            flightType: "مستقیم",
            date: "۱۴ آبان ۱۴۰۳",
            time: "۱۴:۳۰",
          }),
          StatsGrid({ baggage: "۱۰ کیلوگرم", flightNumber: "W5-115" }),
          TicketStatus({ status: "آپلود و تأیید شد" }),
          RewardBanner({
            amount: "25.000",
            currency: "OMR",
            basis: "محاسبه شده بر اساس ۱۰ کیلوگرم",
          }),
          WarningBox({
            message:
              "با تأیید این اطلاعات، شما صحت تمام موارد فوق را گواهی می‌کنید.",
          })
        );
        return main;
      })(),
      BottomAction({
        label: "تأیید و ثبت نهایی",
        onClick: () => alert("سفر با موفقیت ثبت شد!"),
      })
    );
  }

  render();
  root.appendChild(app);
}

initApp();
