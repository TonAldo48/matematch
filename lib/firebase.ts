import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDm0q_jPQHN1-4wwx_xjnq6kU2iGowLd6o",
  authDomain: "matematch1.firebaseapp.com",
  projectId: "matematch1",
  storageBucket: "matematch1.firebasestorage.app",
  messagingSenderId: "463232353707",
  appId: "1:463232353707:web:70faa2130a62adfb22beee",
  measurementId: "G-FSBTG0N3GJ"
};

const app = initializeApp(firebaseConfig);

// Only initialize analytics on the client side
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export const auth = getAuth(app);
export { analytics }; 