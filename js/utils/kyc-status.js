const DEFAULT_STORAGE_KEY = 'carrytomeKycRegistered';

const LEGACY_KEYS = [
  DEFAULT_STORAGE_KEY,
  'kycRegistered',
  'kyc_verified',
  'travelerKycRegistered',
  'traveler_kyc_registered',
];

export function isTravelerKycRegistered() {
  try {
    for (const key of LEGACY_KEYS) {
      const value = localStorage.getItem(key);
      if (!value) continue;
      if (value === 'true') return true;
      if (value === '1') return true;
      if (value.toLowerCase?.() === 'verified') return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function setTravelerKycRegistered(isRegistered) {
  try {
    localStorage.setItem(DEFAULT_STORAGE_KEY, isRegistered ? 'true' : 'false');
  } catch {
    // ignore storage errors
  }
}

