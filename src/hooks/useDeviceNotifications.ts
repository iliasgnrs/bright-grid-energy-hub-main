import { useEffect, useRef, useCallback } from 'react';
import type { Device } from './useDeviceTracker';

export function useDeviceNotifications(devices: Device[]) {
  const notifiedRef = useRef<Set<string>>(new Set());

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Request permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Watch for exceeding devices
  useEffect(() => {
    devices.forEach((device) => {
      if (device.isExceeding && device.isActive && !notifiedRef.current.has(device.id)) {
        notifiedRef.current.add(device.id);
        sendNotification(device);
      }

      // Reset notification flag when device is turned off or no longer exceeding
      if (!device.isActive || !device.isExceeding) {
        notifiedRef.current.delete(device.id);
      }
    });
  }, [devices]);
}

function sendNotification(device: Device) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const minutes = Math.floor(device.activeSeconds / 60);

  new Notification(`⚡ ${device.name} — Time Limit Exceeded`, {
    body: `Active for ${minutes}m, exceeding the ${device.maxActiveMinutes}m limit. Consider shutting it down.`,
    icon: '/favicon.ico',
    tag: `electrack-${device.id}`,
  });
}
