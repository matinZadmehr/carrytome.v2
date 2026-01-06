export function initCargoCategories() {
    const searchInput = document.querySelector('[data-page="cargo-cat"] input[type="text"]');
    if (!searchInput) return;

    const container = document.querySelector('[data-page="cargo-cat"] .flex.flex-col.gap-3.mt-2');
    if (!container) return;

    const buttons = container.querySelectorAll('button[type="button"]');
    const categories = [
        { name: "فلزات ارزشمند", keywords: ["طلا", "جواهر", "نقره"] },
        { name: "اسناد و مدارک", keywords: ["مدارک", "اسناد", "پاسپورت", "شناسنامه", "قرارداد", "سکه"] },
        { name: "الکترونیک", keywords: ["الکترونیک", "موبایل", "لپ", "دوربین", "گوشی", "آیفون"] },
        { name: "پزشکی و بهداشتی", keywords: ["دارو", "پزشکی", "تجهیزات", "بهداشتی"] },
        { name: "کالای شکستنی", keywords: ["تابلو", "مجسمه", "ظروف شیشه ای"] },
        { name: "سایر موارد", keywords: ["سایر", "جعبه", "عمومی", "سایر"] },
    ];

    // Load previously saved selections
    const selectedCategories = new Set();
    function loadSavedCategories() {
        try {
            let savedData = sessionStorage.getItem('cargoCategories') || localStorage.getItem('cargoCategories');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                parsed.forEach(index => selectedCategories.add(index));
                console.log('Loaded saved cargo categories:', parsed);
            }
        } catch (error) {
            console.error('Error loading saved cargo categories:', error);
        }
    }

    function saveCategories() {
        try {
            const data = Array.from(selectedCategories);
            localStorage.setItem('cargoCategories', JSON.stringify(data));
            sessionStorage.setItem('cargoCategories', JSON.stringify(data));
            console.log('Cargo categories saved:', data);
        } catch (error) {
            console.error('Error saving cargo categories:', error);
        }
    }

    // Restore UI based on saved selections
    function restoreUI() {
        buttons.forEach((button, index) => {
            const circle = button.querySelector("div:last-child");
            if (selectedCategories.has(index)) {
                circle.style.borderColor = "#0f6df0";
                circle.style.background = "#0f6df0";
                circle.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px; color: white;">check</span>';
                button.classList.add("border-primary");
                button.style.borderColor = "#0f6df0";
            }
        });
        updateContinueButton();
    }

    function updateContinueButton() {
        const continueButton = document.querySelector('[data-page="cargo-cat"] button[data-route="cargo-weight"]');
        if (continueButton) {
            const count = selectedCategories.size;
            const textSpan = continueButton.querySelector("span:first-child");
            if (textSpan) {
                textSpan.textContent = count > 0 ? `ادامه (${count})` : "ادامه";
            }
        }
    }

    // Filter buttons based on input
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        buttons.forEach((button) => {
            const text = button.textContent.toLowerCase();
            button.style.display = !query || text.includes(query) ? "" : "none";
        });
    });

    // Handle button selection
    buttons.forEach((button, index) => {
        button.addEventListener("click", () => {
            const circle = button.querySelector("div:last-child");
            if (selectedCategories.has(index)) {
                selectedCategories.delete(index);
                circle.style.background = "";
                circle.style.borderColor = "";
                circle.innerHTML = "";
                button.classList.remove("border-primary");
                button.style.borderColor = "";
            } else {
                selectedCategories.add(index);
                circle.style.borderColor = "#0f6df0";
                circle.style.background = "#0f6df0";
                circle.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px; color: white;">check</span>';
                button.classList.add("border-primary");
                button.style.borderColor = "#0f6df0";
            }

            updateContinueButton();
            saveCategories();
        });
    });

    // Initialize
    loadSavedCategories();
    restoreUI();
}
