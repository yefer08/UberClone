import Config from 'react-native-config';

const FIRESTORE_BASE_URL = 'https://firestore.googleapis.com/v1';

function getFirestoreConfig() {
  return {
    projectId: Config.FIREBASE_PROJECT_ID,
    apiKey: Config.FIREBASE_WEB_API_KEY,
  };
}

export function isFirebaseConfigured() {
  const { projectId, apiKey } = getFirestoreConfig();
  return !!projectId && !!apiKey;
}

function buildCollectionUrl() {
  const { projectId, apiKey } = getFirestoreConfig();
  return `${FIRESTORE_BASE_URL}/projects/${projectId}/databases/(default)/documents/trips?key=${apiKey}`;
}

function buildDocumentUrl(localId) {
  const { projectId, apiKey } = getFirestoreConfig();
  return `${FIRESTORE_BASE_URL}/projects/${projectId}/databases/(default)/documents/trips/${encodeURIComponent(localId)}?key=${apiKey}`;
}

function buildUpdateMaskQuery(fieldPaths) {
  if (!Array.isArray(fieldPaths) || fieldPaths.length === 0) {
    return '';
  }

  const uniqueFields = Array.from(new Set(fieldPaths));
  return uniqueFields.map(field => `updateMask.fieldPaths=${encodeURIComponent(field)}`).join('&');
}

function serializeTrip(trip) {
  return {
    fields: {
      localId: { stringValue: String(trip.id || '') },
      origin: { stringValue: String(trip.origin || '') },
      destination: { stringValue: String(trip.destination || '') },
      date: { stringValue: String(trip.date || '') },
      distance: { stringValue: String(trip.distance || '') },
      eta: { stringValue: String(trip.eta || '') },
      cost: { stringValue: String(trip.cost || '') },
      vehicle: { stringValue: String(trip.vehicle || '') },
      status: { stringValue: String(trip.status || 'idle') },
      paymentMethod: { stringValue: String(trip.paymentMethod || 'pending') },
      createdAt: { integerValue: String(Date.now()) },
    },
  };
}

function mapDocumentToTrip(document) {
  const fields = document?.fields || {};
  const id = document?.name?.split('/').pop();

  return {
    id: decodeURIComponent(id || '') || fields.localId?.stringValue || Date.now().toString(),
    origin: fields.origin?.stringValue || '',
    destination: fields.destination?.stringValue || '',
    date: fields.date?.stringValue || '',
    distance: fields.distance?.stringValue || '',
    eta: fields.eta?.stringValue || '',
    cost: fields.cost?.stringValue || '',
    vehicle: fields.vehicle?.stringValue || '',
    status: fields.status?.stringValue || 'idle',
    paymentMethod: fields.paymentMethod?.stringValue || 'pending',
    createdAt: Number(fields.createdAt?.integerValue || 0),
  };
}

export async function appendTripToFirebase(trip) {
  if (!isFirebaseConfigured()) {
    return;
  }

  try {
    const response = await fetch(buildDocumentUrl(trip.id), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serializeTrip(trip)),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn('Firebase append trip error:', errorBody);
    }
  } catch (error) {
    console.warn('Firebase append trip exception:', error.message);
  }
}

function serializeTripChanges(changes) {
  const fields = {};
  const fieldNames = [];

  if (typeof changes.status !== 'undefined') {
    fields.status = { stringValue: String(changes.status || 'idle') };
    fieldNames.push('status');
  }
  if (typeof changes.paymentMethod !== 'undefined') {
    fields.paymentMethod = { stringValue: String(changes.paymentMethod || 'pending') };
    fieldNames.push('paymentMethod');
  }
  if (typeof changes.vehicle !== 'undefined') {
    fields.vehicle = { stringValue: String(changes.vehicle || '') };
    fieldNames.push('vehicle');
  }

  return { fields, fieldNames };
}

export async function updateTripInFirebase(localId, changes) {
  if (!isFirebaseConfigured() || !localId) {
    return;
  }

  const payload = serializeTripChanges(changes);
  if (!Object.keys(payload.fields).length) {
    return;
  }

  const updateMask = buildUpdateMaskQuery(payload.fieldNames);
  const updateUrl = `${buildDocumentUrl(localId)}${updateMask ? `&${updateMask}` : ''}`;

  try {
    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn('Firebase update trip error:', errorBody);
    }
  } catch (error) {
    console.warn('Firebase update trip exception:', error.message);
  }
}

export async function loadTripsFromFirebase() {
  if (!isFirebaseConfigured()) {
    return [];
  }

  try {
    const response = await fetch(`${buildCollectionUrl()}&pageSize=50`);
    if (!response.ok) {
      const errorBody = await response.text();
      console.warn('Firebase load trips error:', errorBody);
      return [];
    }

    const data = await response.json();
    const documents = Array.isArray(data?.documents) ? data.documents : [];

    return documents
      .map(mapDocumentToTrip)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.warn('Firebase load trips exception:', error.message);
    return [];
  }
}

export async function syncTripsToFirebase(trips) {
  if (!isFirebaseConfigured()) {
    return;
  }

  const safeTrips = Array.isArray(trips) ? trips : [];
  if (safeTrips.length === 0) {
    return;
  }

  await Promise.allSettled(safeTrips.map(trip => appendTripToFirebase(trip)));
}
