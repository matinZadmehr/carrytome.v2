function textOrNull(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function setText(el, value) {
  if (!el) return;
  const next = textOrNull(value);
  if (next == null) return;
  el.textContent = next;
}

function safeParseJson(text) {
  if (typeof text !== 'string' || !text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getSelectedFlightSummary() {
  try {
    const summary = safeParseJson(sessionStorage.getItem('selectedFlightSummary'));
    if (summary) return summary;
  } catch {
    // ignore
  }
  return null;
}

function getSelectedFlightNumber() {
  try {
    return textOrNull(sessionStorage.getItem('selectedFlightNumber'));
  } catch {
    return null;
  }
}

export function initOrderReviewPage() {
  const page = document.querySelector('[data-page="order-review"]');
  if (!page) return;

  const summary = getSelectedFlightSummary();

  setText(page.querySelector('#order-review-origin-code'), summary?.originCode);
  setText(page.querySelector('#order-review-origin-city'), summary?.originCity);
  setText(page.querySelector('#order-review-destination-code'), summary?.destinationCode);
  setText(page.querySelector('#order-review-destination-city'), summary?.destinationCity);
  setText(page.querySelector('#order-review-flight-type'), summary?.flightType);
  setText(page.querySelector('#order-review-date'), summary?.date);
  setText(page.querySelector('#order-review-time'), summary?.time);
  setText(page.querySelector('#order-review-baggage'), summary?.baggage);

  const flightNumber = getSelectedFlightNumber() || summary?.flightNumber;
  setText(page.querySelector('#order-review-flight-number'), flightNumber);

  setText(page.querySelector('#order-review-reward-amount'), summary?.rewardAmount);
  setText(page.querySelector('#order-review-reward-currency'), summary?.rewardCurrency);
}

