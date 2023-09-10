// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAplsukZUIg6emDEn9fvtMZM9Q_JeJExZg',
  authDomain: 'pokerplan-58981.firebaseapp.com',
  projectId: 'pokerplan-58981',
  storageBucket: 'pokerplan-58981.appspot.com',
  messagingSenderId: '350997257080',
  appId: '1:350997257080:web:1f6bf38f172a54757c868d',
  measurementId: 'G-BK3078ECPW',
}

export const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const database = getFirestore(app)
