// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCAtu8Hp-SUSCmEiFptfYBuhqMzSPQV-Jk",
  authDomain: "fawstudio-31d9a.firebaseapp.com",
  projectId: "fawstudio-31d9a",
  storageBucket: "fawstudio-31d9a.firebasestorage.app",
  messagingSenderId: "65346193390",
  appId: "1:65346193390:web:fbf7774f82de7b3561b0ff"
});

const messaging = firebase.messaging();

// 背景訊息處理
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || '📬 You Got Mail!';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new contact message',
    icon: '/img/logopng.png',
    badge: '/img/logopng.png',
    tag: 'faw-notification',
    renotify: true,
    requireInteraction: true,
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 點擊通知時開啟網站
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/fawentro')
  );
});
