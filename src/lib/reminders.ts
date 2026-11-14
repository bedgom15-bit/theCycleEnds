import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { idsToCancel, planReminders, type PlannedNotification } from './reminderPlan';
import type { Habit, Reminder } from './storage';
import { todayKey } from './dates';

export const isNative = () => Capacitor.isNativePlatform();

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export async function checkPermission(): Promise<PermissionState> {
  if (isNative()) {
    const { display } = await LocalNotifications.checkPermissions();
    return display === 'granted' ? 'granted' : display === 'denied' ? 'denied' : 'prompt';
  }
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission === 'default' ? 'prompt' : Notification.permission;
}

export async function requestPermission(): Promise<PermissionState> {
  if (isNative()) {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted' ? 'granted' : display === 'denied' ? 'denied' : 'prompt';
  }
  if (!('Notification' in window)) return 'unsupported';
  const p = await Notification.requestPermission();
  return p === 'default' ? 'prompt' : p;
}

// ---------- Web: solo mientras la app está abierta ----------
let webTimer: number | undefined;

function scheduleWeb(plan: PlannedNotification[]) {
  window.clearTimeout(webTimer);
  const next = plan[0];
  if (!next || !('Notification' in window) || Notification.permission !== 'granted') return;
  const delay = next.at.getTime() - Date.now();
  if (delay > 2 ** 31 - 1) return; // límite de setTimeout
  webTimer = window.setTimeout(async () => {
    const reg = await navigator.serviceWorker?.getRegistration();
    const opts = { body: next.body, icon: `${import.meta.env.BASE_URL}icons/icon-192.png`, tag: 'daily-reminder' };
    if (reg) reg.showNotification(next.title, opts);
    else new Notification(next.title, opts);
  }, delay);
}

// ---------- Nativo: notificaciones programadas en el sistema ----------
async function scheduleNative(plan: PlannedNotification[], todayDone: boolean) {
  const { notifications } = await LocalNotifications.getPending();
  const pending = notifications.map((n) => ({
    id: n.id,
    at: n.schedule?.at ? new Date(n.schedule.at) : null,
  }));
  const cancel = idsToCancel(pending, plan, new Date(), todayDone);
  await LocalNotifications.cancel({ notifications: cancel.map((id) => ({ id })) });
  if (plan.length === 0) return;
  const { display } = await LocalNotifications.checkPermissions();
  if (display !== 'granted') return;
  await LocalNotifications.schedule({
    notifications: plan.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      schedule: { at: n.at, allowWhileIdle: true },
      smallIcon: 'ic_stat_notify',
      iconColor: '#000000',
      channelId: 'daily-reminder',
    })),
  });
}

let channelReady = false;
async function ensureChannel() {
  if (channelReady || Capacitor.getPlatform() !== 'android') return;
  await LocalNotifications.createChannel({
    id: 'daily-reminder',
    name: 'Recordatorio diario',
    description: 'Te recuerda registrar tu día',
    importance: 4,
    visibility: 1,
  });
  channelReady = true;
}

// ---------- Alarmas exactas (Android 12+) ----------
export type ExactState = 'granted' | 'denied' | 'unsupported';

export async function checkExactAlarms(): Promise<ExactState> {
  if (Capacitor.getPlatform() !== 'android') return 'unsupported';
  try {
    const { exact_alarm } = await LocalNotifications.checkExactNotificationSetting();
    return exact_alarm === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'unsupported';
  }
}

/** Abre el ajuste del sistema "Alarmas y recordatorios" de la app. */
export async function openExactAlarmSettings(): Promise<ExactState> {
  try {
    const { exact_alarm } = await LocalNotifications.changeExactNotificationSetting();
    return exact_alarm === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'unsupported';
  }
}

// Las sincronizaciones se encadenan para que dos llamadas seguidas no se pisen.
let queue: Promise<void> = Promise.resolve();

/** Reprograma todos los recordatorios según los datos actuales. */
export function syncReminders(habits: Habit[], reminder: Reminder): Promise<void> {
  queue = queue.then(async () => {
    const plan = planReminders(habits, reminder, new Date());
    const today = todayKey();
    const todayDone = habits.length > 0 && habits.every((h) => today in h.entries);
    try {
      if (isNative()) {
        await ensureChannel();
        await scheduleNative(reminder.enabled ? plan : [], todayDone || !reminder.enabled);
      } else {
        scheduleWeb(plan);
      }
    } catch (e) {
      console.warn('No se pudieron programar los recordatorios', e);
    }
  });
  return queue;
}
