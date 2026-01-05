export function loadTrips() {
  try {
    const trips = JSON.parse(localStorage.getItem('my_trips') || '[]');
    console.log(`📄 Loaded ${trips.length} trips from storage`);
    return trips;
  } catch (error) {
    console.error('❌ Error loading trips:', error);
    return [];
  }
}

/* Save trips (array) */
export function saveTrips(trips) {
  try {
    localStorage.setItem('my_trips', JSON.stringify(trips));
    console.log(`💾 Saved ${trips.length} trips to storage`);
    return true;
  } catch (error) {
    console.error('❌ Error saving trips:', error);
    return false;
  }
}

/* Save a single trip (alias for consistency) */
export function saveTrip(tripOrTrips) {
  // If it's an array, save as trips
  if (Array.isArray(tripOrTrips)) {
    return saveTrips(tripOrTrips);
  }
  
  // If it's a single trip, add/update in existing trips
  const trips = loadTrips();
  const existingIndex = trips.findIndex(t => t.id === tripOrTrips.id);
  
  if (existingIndex !== -1) {
    // Update existing trip
    trips[existingIndex] = { ...trips[existingIndex], ...tripOrTrips };
  } else {
    // Add new trip with ID and timestamp
    const tripWithId = {
      ...tripOrTrips,
      id: tripOrTrips.id || crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    trips.push(tripWithId);
  }
  
  return saveTrips(trips);
}

/* Remove a trip by ID */
export function removeTrip(tripId) {
  const trips = loadTrips();
  const initialLength = trips.length;
  const filteredTrips = trips.filter(trip => trip.id !== tripId);
  
  if (filteredTrips.length < initialLength) {
    saveTrips(filteredTrips);
    console.log(`🗑️ Removed trip: ${tripId}`);
    return true;
  }
  
  console.log(`⚠️ Trip not found: ${tripId}`);
  return false;
}

/* Add a new trip */
export function addTrip(trip) {
  const trips = loadTrips();
  
  const tripWithId = {
    ...trip,
    id: trip.id || Date.now(),
    createdAt: new Date().toISOString(),
    status: 'submitted',
    submittedDate: new Date().toISOString()
  };
  
  trips.push(tripWithId);
  saveTrips(trips);
  
  console.log(`➕ Added new trip: ${tripWithId.id}`);
  return tripWithId;
}

/* Update trip status */
export function updateTripStatus(tripId, newStatus) {
  const trips = loadTrips();
  const trip = trips.find(t => t.id === tripId);
  
  if (trip) {
    trip.status = newStatus;
    trip.updatedAt = new Date().toISOString();
    saveTrips(trips);
    console.log(`✏️ Updated trip ${tripId} status to: ${newStatus}`);
    return true;
  }
  
  return false;
}

/* Clear all trips */
export function clearTrips() {
  localStorage.removeItem('my_trips');
  console.log('🧹 Cleared all trips');
}