// pages/traveler-flight-date.js

export function initTravelerFlightDate() {
    const page = document.querySelector(
        '#page-traveler-flight-date[data-page="traveler-flight-date"]'
    );
    if (!page) return;

    /* ======================
       STATE
    ====================== */
    let state = {
        year: 2024,
        month: 10, // 0-based
        day: 14,
        hour: 9,
        minute: 30,
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    /* ======================
       ELEMENTS
    ====================== */
    const monthLabel = page.querySelector('[data-month-label]');
    const prevMonthBtn = page.querySelector('[data-prev-month]');
    const nextMonthBtn = page.querySelector('[data-next-month]');
    const daysGrid = page.querySelector('[data-days-grid]');

    const hourInput = page.querySelector('#flight-hour');
    const minuteInput = page.querySelector('#flight-minute');

    const confirmBtn = page.querySelector('[data-confirm-flight-date]');

    /* ======================
       HELPERS
    ====================== */
    const pad = (n) => String(n).padStart(2, '0');
    const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const firstDayOffset = (y, m) => new Date(y, m, 1).getDay();

    /* ======================
       CALENDAR
    ====================== */
    function renderCalendar() {
        daysGrid.innerHTML = '';
        monthLabel.textContent = `${monthNames[state.month]} ${state.year}`;
        const offset = firstDayOffset(state.year, state.month);
        const totalDays = daysInMonth(state.year, state.month);

        // empty spans for offset
        for (let i = 0; i < offset; i++) daysGrid.appendChild(document.createElement('span'));

        for (let d = 1; d <= totalDays; d++) {
            const btn = document.createElement('button');
            btn.textContent = d;
            btn.dataset.day = d;
            btn.className = 'h-9 w-9 rounded-full text-sm flex items-center justify-center';

            if (d === state.day) btn.classList.add('bg-primary', 'text-white', 'font-bold', 'scale-105');
            else btn.classList.add('hover:bg-slate-100', 'dark:hover:bg-slate-700');

            btn.addEventListener('click', () => {
                state.day = d;
                renderCalendar();
            });

            daysGrid.appendChild(btn);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        state.month--;
        if (state.month < 0) {
            state.month = 11;
            state.year--;
        }
        state.day = 1;
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        state.month++;
        if (state.month > 11) {
            state.month = 0;
            state.year++;
        }
        state.day = 1;
        renderCalendar();
    });

    /* ======================
       TIME INPUT HANDLING
    ====================== */
    function syncTimeInputs() {
        // ensure hour and minute are numbers and valid
        state.hour = Math.max(0, Math.min(23, parseInt(hourInput.value) || 0));
        state.minute = Math.max(0, Math.min(59, parseInt(minuteInput.value) || 0));

        // if minutes >= 60 or <0, adjust hour
        if (state.minute >= 60) {
            state.hour = (state.hour + Math.floor(state.minute / 60)) % 24;
            state.minute = state.minute % 60;
        } else if (state.minute < 0) {
            let hChange = Math.ceil(Math.abs(state.minute) / 60);
            state.hour = (state.hour - hChange + 24) % 24;
            state.minute = (state.minute + hChange * 60) % 60;
        }

        // update inputs
        hourInput.value = pad(state.hour);
        minuteInput.value = pad(state.minute);
    }

    hourInput.addEventListener('input', syncTimeInputs);
    minuteInput.addEventListener('input', syncTimeInputs);

    /* ======================
       CONFIRM
    ====================== */
    confirmBtn.addEventListener('click', () => {
        const result = {
            ...state,
            iso: new Date(state.year, state.month, state.day, state.hour, state.minute).toISOString()
        };
        console.log('Selected flight datetime:', result);
        window.flightDate = result;
    });

    /* ======================
       INIT
    ====================== */
    renderCalendar();
    syncTimeInputs();

    console.log('Traveler Flight Date initialized (calendar + 24h time picker)');
}
