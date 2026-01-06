// components/sliders.js
export function initCargoData() {
  // -----------------------------
  // 1️⃣ Cargo Categories
  // -----------------------------
  const categoryInput = document.querySelector('[data-page="cargo-cat"] input[type="text"]');
  const categoryContainer = document.querySelector('[data-page="cargo-cat"] .flex.flex-col.gap-3.mt-2');
  if (categoryInput && categoryContainer) {
    const buttons = categoryContainer.querySelectorAll('button[type="button"]');
    const selectedCategories = new Set();

    // Load saved categories
    try {
      const saved = JSON.parse(localStorage.getItem('cargoCategories') || '[]');
      saved.forEach(index => selectedCategories.add(index));
      buttons.forEach((button, idx) => {
        if (selectedCategories.has(idx)) markCategorySelected(button);
      });
      console.log('Loaded saved categories:', saved);
    } catch (e) { console.warn('Error loading categories:', e); }

    // Filter input
    categoryInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      buttons.forEach(btn => {
        const text = btn.textContent.toLowerCase();
        btn.style.display = (!query || text.includes(query)) ? '' : 'none';
      });
    });

    // Button click
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        if (selectedCategories.has(index)) {
          selectedCategories.delete(index);
          markCategoryUnselected(button);
        } else {
          selectedCategories.add(index);
          markCategorySelected(button);
        }
        localStorage.setItem('cargoCategories', JSON.stringify([...selectedCategories]));

        // Update continue button
        const continueBtn = document.querySelector('[data-page="cargo-cat"] button[data-route="cargo-weight"]');
        if (continueBtn) {
          const span = continueBtn.querySelector('span:first-child');
          span.textContent = selectedCategories.size > 0 ? `ادامه (${selectedCategories.size})` : 'ادامه';
        }

        console.log('Selected categories:', [...selectedCategories]);
      });
    });

    function markCategorySelected(button) {
      const circle = button.querySelector('div:last-child');
      circle.style.borderColor = '#0f6df0';
      circle.style.background = '#0f6df0';
      circle.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px; color: white;">check</span>';
      button.classList.add('border-primary');
      button.style.borderColor = '#0f6df0';
    }

    function markCategoryUnselected(button) {
      const circle = button.querySelector('div:last-child');
      circle.style.borderColor = '';
      circle.style.background = '';
      circle.innerHTML = '';
      button.classList.remove('border-primary');
      button.style.borderColor = '';
    }
  }

  // -----------------------------
  // 2️⃣ Cargo Weight Slider
  // -----------------------------
  const cargoWeightSlider = document.querySelector('[data-page="cargo-weight"] input[type="range"]');
  const cargoWeightDisplay = document.querySelector('#cargo-weight-display');

  if (cargoWeightSlider && cargoWeightDisplay) {
    // Load saved value
    const savedWeight = sessionStorage.getItem('cargoWeight') || localStorage.getItem('cargoWeight');
    if (savedWeight) {
      cargoWeightSlider.value = savedWeight;
      cargoWeightDisplay.textContent = savedWeight;
      updateSliderFill(cargoWeightSlider);
    }

    cargoWeightSlider.addEventListener('input', () => {
      const val = cargoWeightSlider.value;
      cargoWeightDisplay.textContent = val;
      localStorage.setItem('cargoWeight', val);
      sessionStorage.setItem('cargoWeight', val);
      updateSliderFill(cargoWeightSlider);
      console.log('Cargo weight updated:', val);
    });
  }

  // -----------------------------
  // 3️⃣ Cargo Value Slider + Text + Buttons
  // -----------------------------
  const cargoValSlider = document.querySelector('[data-page="cargo-val"] input[type="range"]');
  const cargoValDisplay = document.querySelector('#cargo-value-display');
  const minusBtn = document.querySelector('#page-cargo-val button:first-child');
  const plusBtn = document.querySelector('#page-cargo-val button:last-child');

  if (cargoValSlider && cargoValDisplay) {
    // Load saved value
    const savedVal = sessionStorage.getItem('cargoValue') || localStorage.getItem('cargoValue');
    if (savedVal) {
      cargoValSlider.value = savedVal;
      cargoValDisplay.value = savedVal;
      updateSliderFill(cargoValSlider);
      console.log('Loaded cargo value:', savedVal);
    }

    // Slider input
    cargoValSlider.addEventListener('input', () => {
      const val = cargoValSlider.value;
      cargoValDisplay.value = val;
      localStorage.setItem('cargoValue', val);
      sessionStorage.setItem('cargoValue', val);
      updateSliderFill(cargoValSlider);
      console.log('Cargo value updated via slider:', val);
    });

    // Minus button
    minusBtn?.addEventListener('click', () => {
      let val = Number(cargoValSlider.value);
      val = Math.max(Number(cargoValSlider.min), val - Number(cargoValSlider.step));
      cargoValSlider.value = val;
      cargoValDisplay.value = val;
      updateSliderFill(cargoValSlider);
      localStorage.setItem('cargoValue', val);
      sessionStorage.setItem('cargoValue', val);
      console.log('Cargo value decreased:', val);
    });

    // Plus button
    plusBtn?.addEventListener('click', () => {
      let val = Number(cargoValSlider.value);
      val = Math.min(Number(cargoValSlider.max), val + Number(cargoValSlider.step));
      cargoValSlider.value = val;
      cargoValDisplay.value = val;
      updateSliderFill(cargoValSlider);
      localStorage.setItem('cargoValue', val);
      sessionStorage.setItem('cargoValue', val);
      console.log('Cargo value increased:', val);
    });
  }
}

// -----------------------------
// Slider fill funcconst cargoValSlidertion
// -----------------------------
export function updateSliderFill(slider) {
  if (!slider) return;
  const min = Number(slider.min || 0);
  const max = Number(slider.max || 100);
  const val = Number(slider.value);
  const percent = ((val - min) / (max - min)) * 100;

  slider.style.background = `
    linear-gradient(
      to left,
      #3b82f6 ${percent}%,
      #e2e8f0 ${percent}%
    )
  `;
}
