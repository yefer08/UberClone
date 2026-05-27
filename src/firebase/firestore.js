import firestore from '@react-native-firebase/firestore';

const ridesCollection = firestore().collection('rides');

function getUserId(user) {
  if (user?.email) {
    return user.email.toLowerCase();
  }
  if (user?.phone) {
    return user.phone;
  }
  return 'anonymous';
}

export async function saveRideForUser(user, rideData) {
  const userId = getUserId(user);

  if (userId === 'anonymous') {
    throw new Error('Profile incomplete. Provide email or phone to save ride history.');
  }

  const document = {
    userId,
    userName: user?.name || '',
    origin: rideData.origin || {},
    destination: rideData.destination || {},
    selectedVehicle: rideData.selectedVehicle || 'Economico',
    distanceText: rideData.distanceText || '',
    etaText: rideData.etaText || '',
    fare: rideData.fare || 0,
    status: rideData.status || 'requested',
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  const result = await ridesCollection.add(document);
  return result.id;
}

export async function getRidesForUser(user) {
  const userId = getUserId(user);

  if (userId === 'anonymous') {
    return [];
  }

  const snapshot = await ridesCollection
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteRide(id) {
  await ridesCollection.doc(id).delete();
}
