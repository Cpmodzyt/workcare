import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { isFirebaseLive } from './firebase';

export async function requestNotificationPermissionAndGetToken(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return null;
    }

    if (isFirebaseLive()) {
      try {
        const messaging = getMessaging();
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        const currentToken = await getToken(messaging, { vapidKey });
        return currentToken;
      } catch (err) {
        console.warn('FCM token registration warning:', err);
      }
    }
  } catch (error) {
    console.warn('Notification permission error:', error);
  }

  return null;
}

export function listenToForegroundNotifications(onReceive: (payload: any) => void) {
  if (isFirebaseLive()) {
    try {
      const messaging = getMessaging();
      return onMessage(messaging, (payload) => {
        onReceive(payload);
      });
    } catch {}
  }
  return () => {};
}
