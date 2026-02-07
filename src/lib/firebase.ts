import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, get } from 'firebase/database';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCAtu8Hp-SUSCmEiFptfYBuhqMzSPQV-Jk",
  authDomain: "fawstudio-31d9a.firebaseapp.com",
  databaseURL: "https://fawstudio-31d9a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fawstudio-31d9a",
  storageBucket: "fawstudio-31d9a.firebasestorage.app",
  messagingSenderId: "65346193390",
  appId: "1:65346193390:web:fbf7774f82de7b3561b0ff",
  measurementId: "G-R231LL2XB7"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Google 登入
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

// 登出
export const logOut = async () => {
  await signOut(auth);
};

// 監聽登入狀態
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const submitContact = async (data: {
  name: string;
  email: string;
  company: string;
  message: string;
  budget?: string;
}) => {
  const contactsRef = ref(database, 'contacts');
  return push(contactsRef, {
    ...data,
    timestamp: Date.now(),
    createdAt: new Date().toISOString()
  });
};

// Firebase Cloud Messaging
let messaging: ReturnType<typeof getMessaging> | null = null;

const initMessaging = () => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      messaging = getMessaging(app);
    } catch (e) {
      console.log('FCM not supported:', e);
    }
  }
  return messaging;
};

// 請求推播權限並取得 token
export const requestNotificationPermission = async (vapidKey: string) => {
  try {
    console.log('Step 1: Checking current permission:', Notification.permission);
    
    // iOS Safari 需要在用戶手勢後才能請求
    if (Notification.permission === 'default') {
      console.log('Step 2: Requesting permission...');
      const permission = await Notification.requestPermission();
      console.log('Step 2 result:', permission);
      if (permission !== 'granted') {
        throw new Error('Notification permission denied by user');
      }
    } else if (Notification.permission === 'denied') {
      throw new Error('Notification permission was previously denied. Please enable in settings.');
    }
    
    console.log('Step 3: Permission granted, checking Service Worker support...');
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    console.log('Step 4: Registering Service Worker...');
    let registration;
    try {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      console.log('Step 4 result: SW registered', registration.scope);
      
      // 等待 SW 準備好
      await navigator.serviceWorker.ready;
      console.log('Step 4b: SW ready');
    } catch (swError) {
      console.error('Service Worker registration failed:', swError);
      throw new Error('Service Worker registration failed: ' + (swError instanceof Error ? swError.message : String(swError)));
    }

    console.log('Step 5: Initializing FCM...');
    const msg = initMessaging();
    if (!msg) throw new Error('FCM Messaging not supported on this browser');

    console.log('Step 6: Getting FCM token with VAPID key...');
    console.log('VAPID Key (first 20 chars):', vapidKey.substring(0, 20));
    
    const token = await getToken(msg, {
      vapidKey,
      serviceWorkerRegistration: registration
    });
    
    console.log('Step 7: Token received!', token ? 'Success' : 'Empty token');
    
    if (!token) {
      throw new Error('FCM returned empty token');
    }
    
    return token;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    throw error;
  }
};

// 儲存 FCM token 到資料庫
export const saveFCMToken = async (userId: string, token: string) => {
  const tokenRef = ref(database, `fcmTokens/${userId}`);
  await set(tokenRef, {
    token,
    updatedAt: Date.now()
  });
};

// 取得已儲存的 FCM token
export const getFCMToken = async (userId: string) => {
  const tokenRef = ref(database, `fcmTokens/${userId}`);
  const snapshot = await get(tokenRef);
  return snapshot.val()?.token || null;
};

// 監聽前景訊息
export const onForegroundMessage = (callback: (payload: unknown) => void) => {
  const msg = initMessaging();
  if (!msg) return () => {};
  return onMessage(msg, callback);
};

export { database, auth };
