// flight-order-submission.js
// Handles the "قبول درخواست" click on registered-flight cards.
// IMPORTANT: This should NOT create/save orders; it only routes based on KYC.

import { isTravelerKycRegistered } from './kyc-status.js';

function extractFlightSummary(btn) {
  const card = btn.closest('.group');
  if (!card) return null;

  const routeText = card.querySelector('h3')?.textContent || '';
  const codes = routeText.match(/[A-Z]{3}/g) || [];
  const originCode = codes[0] || null;
  const destinationCode = codes[1] || null;

  const routeLine = card.querySelector('p')?.textContent || '';
  const cityParts = routeLine.split(' به ').map((p) => p.trim()).filter(Boolean);
  const originCity = cityParts.length >= 2 ? cityParts[0] : null;
  const destinationCity = cityParts.length >= 2 ? cityParts[cityParts.length - 1] : null;

  const badges = Array.from(card.querySelectorAll('span.inline-flex'));
  const dateBadge = badges.find((b) => b.querySelector('.material-symbols-outlined')?.textContent?.includes('calendar_today'));

  const dateText = dateBadge ? dateBadge.textContent.replace('calendar_today', '').trim() : null;

  const rewardText = card.querySelector('.text-primary')?.textContent || '';
  const rewardAmount = (rewardText.match(/[\d.,]+/) || [])[0] || null;
  const rewardCurrency = rewardText.includes('OMR') ? 'OMR' : ((rewardText.match(/[A-Z]{3}/) || [])[0] || null);

  return {
    originCode,
    originCity,
    destinationCode,
    destinationCity,
    flightType: null,
    date: dateText,
    time: null,
    baggage: null,
    rewardAmount,
    rewardCurrency,
    routeLine: routeLine || null,
  };
}

export function initFlightOrderSubmission() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-trip-btn');
    if (!btn) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const flightId = btn.dataset.flightId;
    if (!flightId) return;

    try {
      sessionStorage.setItem('selectedFlightId', String(flightId));
      const summary = extractFlightSummary(btn);
      if (summary) sessionStorage.setItem('selectedFlightSummary', JSON.stringify(summary));
    } catch {
      // ignore storage errors
    }

    const targetRoute = isTravelerKycRegistered() ? 'order-review' : 'traveler-greet';
    if (window.router) window.router.navigate(targetRoute);
    else window.location.hash = `#/${targetRoute}`;
  });
}
