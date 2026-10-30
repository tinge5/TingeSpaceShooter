import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBpJsqcCRy1QXXaaVvHa-nqojDHvadmiW0',
  authDomain: 'tingespaceshooter.firebaseapp.com',
  projectId: 'tingespaceshooter',
  storageBucket: 'tingespaceshooter.firebasestorage.app',
  messagingSenderId: '239153188124',
  appId: '1:239153188124:web:08fd6cac89b4886b0dfed9',
  measurementId: 'G-63KGCVZCN1',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
