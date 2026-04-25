import * as Notifications from 'expo-notifications';
import type { TaxRecord, Part } from '../types/models';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleTaxNotification(
  tax: TaxRecord,
  bikeName: string
): Promise<string | null> {
  try {
    const dueDate = new Date(tax.dueDate);
    const now = new Date();

    const thirtyDaysBefore = new Date(dueDate);
    thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30);

    if (thirtyDaysBefore <= now) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Vehicle Tax Due',
        body: `Tax for ${bikeName} is due in 30 days — ¥${Math.round(tax.amount).toLocaleString()}`,
        data: { type: 'tax', taxId: tax.id, bikeId: tax.motorcycleId },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: thirtyDaysBefore },
    });
    return id;
  } catch {
    return null;
  }
}

export async function schedulePartNotification(
  part: Part,
  bikeName: string,
  daysUntilDue: number
): Promise<string | null> {
  try {
    if (!part.notificationEnabled) return null;

    if (daysUntilDue <= 0) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Maintenance Required',
          body: `${part.name} on ${bikeName} is overdue for replacement`,
          data: { type: 'part', partId: part.id, bikeId: part.motorcycleId },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(Date.now() + 2000) },
      });
      return id;
    }

    const triggerDate = new Date();
    triggerDate.setDate(triggerDate.getDate() + daysUntilDue);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Maintenance Reminder',
        body: `Time to change ${part.name} on ${bikeName}`,
        data: { type: 'part', partId: part.id, bikeId: part.motorcycleId },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {}
}
