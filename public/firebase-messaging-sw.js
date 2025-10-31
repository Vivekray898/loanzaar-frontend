// Firebase Cloud Messaging Service Worker
// This file handles notifications when the app is in the background

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyCLOLFxJbcE-nH1Y46bq9RBaQ0UzVT1REo",
  authDomain: "loanzaar-70afe.firebaseapp.com",
  projectId: "loanzaar-70afe",
  storageBucket: "loanzaar-70afe.firebasestorage.app",
  messagingSenderId: "398266736092",
  appId: "1:398266736092:web:1aa9eaaa75c0d31fd8c97d"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'LoanZaar Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update',
    icon: '/loanzaar-icon.png', // Add your app icon
    badge: '/badge-icon.png',
    tag: payload.data?.type || 'default',
    data: payload.data,
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'View'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Determine which page to open based on notification type
  const notificationType = event.notification.data?.type;
  let urlToOpen = '/dashboard';

  switch (notificationType) {
    case 'new_loan':
      urlToOpen = '/admin/loans';
      break;
    case 'loan_status_update':
      urlToOpen = '/dashboard/applications';
      break;
    case 'new_support_message':
      urlToOpen = '/dashboard/support';
      break;
    case 'new_insurance':
      urlToOpen = '/admin/insurance';
      break;
    default:
      urlToOpen = '/dashboard';
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then(() => client.navigate(urlToOpen));
          }
        }
        // If not open, open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[Service Worker] Firebase messaging service worker loaded');
