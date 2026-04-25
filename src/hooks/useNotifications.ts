import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { requestNotificationPermission } from '../utils/notificationScheduler';

export function useNotifications() {
  const router = useRouter();

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any;
      if (data?.type === 'tax') {
        router.push('/tax');
      } else if (data?.type === 'part') {
        router.push('/(tabs)/parts');
      }
    });
    return () => sub.remove();
  }, [router]);

  return { requestPermissions: requestNotificationPermission };
}
