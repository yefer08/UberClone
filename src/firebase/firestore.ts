import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import firestore from '@react-native-firebase/firestore';

export interface Ride {
  id?: string;
  userId: string;
  origin: string;
  destination: string;
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  fare?: number;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
}

const ridesCollection = firestore().collection('rides');

export async function createRide(ride: Omit<Ride, 'id' | 'createdAt'>) {
  const document = {
    ...ride,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  const result = await ridesCollection.add(document);
  return result.id;
}

export async function getRides() {
  const snapshot = await ridesCollection.orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Ride, 'id'>) }));
}

export async function updateRide(id: string, data: Partial<Omit<Ride, 'id' | 'createdAt'>>) {
  await ridesCollection.doc(id).update(data);
}

export async function deleteRide(id: string) {
  await ridesCollection.doc(id).delete();
}
