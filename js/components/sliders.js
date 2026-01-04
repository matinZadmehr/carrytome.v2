import { delegateEvent } from '../utils/dom.js';

export function initSliders() {
  delegateEvent(document, 'input', 'input[type="range"]', (event) => {
    const slider = event.target;

    // -------- Traveler capacity slider --------
    const travelerPage = slider.closest('[data-page="traveler-capacity"]');
    if (travelerPage) {
      const display = travelerPage.querySelector('#traveler-weight-display');
      if (display) display.textContent = slider.value;
      updateSliderFill(slider);
      return;
    }

    // -------- Cargo weight slider --------
    const cargoPage = slider.closest('[data-page="cargo-weight"]');
    if (cargoPage) {
      const display = cargoPage.querySelector('#cargo-weight-display');
      if (display) display.textContent = slider.value;
      updateSliderFill(slider);
      return;
    }

    // -------- Registered flight price slider --------
    const flightPage = slider.closest('[data-page="registered-flight"]');
    if (flightPage) {
      const display = flightPage.querySelector('#registered-flight-price-display');
      if (display) display.textContent = slider.value;
      updateSliderFill(slider);
      return;
    }

    // Add more sliders here if needed
  });

  // Initialize all sliders on load
  document.querySelectorAll('[data-page] input[type="range"]').forEach(slider => {
    const event = new Event('input');
    slider.dispatchEvent(event);
  });
}

function updateSliderFill(slider) {
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
