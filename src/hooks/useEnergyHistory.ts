import { useState, useEffect, useCallback, useRef } from 'react';
import type { Device } from './useDeviceTracker';

export interface EnergySnapshot {
  timestamp: number; // ms since epoch
  deviceEnergies: Record<string, number>; // deviceId -> kWh at that moment
}

const STORAGE_KEY = 'electrack-energy-history';
const SNAPSHOT_INTERVAL_MS = 60_000; // snapshot every 60s
const MAX_SNAPSHOTS = 10_080; // ~7 days at 1 per minute

function loadHistory(): EnergySnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveHistory(history: EnergySnapshot[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}

export function useEnergyHistory(
  devices: Device[],
  getDeviceCurrentEnergy: (device: Device) => number
) {
  const [history, setHistory] = useState<EnergySnapshot[]>(loadHistory);
  const devicesRef = useRef(devices);
  const getEnergyRef = useRef(getDeviceCurrentEnergy);

  devicesRef.current = devices;
  getEnergyRef.current = getDeviceCurrentEnergy;

  // Take periodic snapshots
  useEffect(() => {
    const takeSnapshot = () => {
      const now = Date.now();
      const deviceEnergies: Record<string, number> = {};
      devicesRef.current.forEach((d) => {
        deviceEnergies[d.id] = getEnergyRef.current(d);
      });

      setHistory((prev) => {
        const next = [...prev, { timestamp: now, deviceEnergies }];
        // Trim to max
        const trimmed = next.length > MAX_SNAPSHOTS ? next.slice(-MAX_SNAPSHOTS) : next;
        saveHistory(trimmed);
        return trimmed;
      });
    };

    // Take an initial snapshot immediately
    takeSnapshot();

    const interval = setInterval(takeSnapshot, SNAPSHOT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Aggregate into hourly buckets for charting
  const getHourlyData = useCallback(
    (hoursBack: number = 24) => {
      const cutoff = Date.now() - hoursBack * 3600_000;
      const relevant = history.filter((s) => s.timestamp >= cutoff);

      if (relevant.length === 0) return [];

      // Group by hour
      const buckets = new Map<string, { label: string; timestamp: number; energies: Record<string, number[]> }>();

      relevant.forEach((snap) => {
        const date = new Date(snap.timestamp);
        const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
        const label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (!buckets.has(hourKey)) {
          buckets.set(hourKey, { label, timestamp: snap.timestamp, energies: {} });
        }

        const bucket = buckets.get(hourKey)!;
        Object.entries(snap.deviceEnergies).forEach(([id, kwh]) => {
          if (!bucket.energies[id]) bucket.energies[id] = [];
          bucket.energies[id].push(kwh);
        });
      });

      // Convert to chart data: use the max energy per hour (cumulative, so max = latest)
      return Array.from(buckets.values())
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((bucket) => {
          const point: Record<string, string | number> = { time: bucket.label };
          Object.entries(bucket.energies).forEach(([id, values]) => {
            point[id] = parseFloat(Math.max(...values).toFixed(4));
          });
          return point;
        });
    },
    [history]
  );

  // Aggregate into daily buckets
  const getDailyData = useCallback(
    (daysBack: number = 7) => {
      const cutoff = Date.now() - daysBack * 86_400_000;
      const relevant = history.filter((s) => s.timestamp >= cutoff);

      if (relevant.length === 0) return [];

      const buckets = new Map<string, { label: string; timestamp: number; energies: Record<string, number[]> }>();

      relevant.forEach((snap) => {
        const date = new Date(snap.timestamp);
        const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const label = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

        if (!buckets.has(dayKey)) {
          buckets.set(dayKey, { label, timestamp: snap.timestamp, energies: {} });
        }

        const bucket = buckets.get(dayKey)!;
        Object.entries(snap.deviceEnergies).forEach(([id, kwh]) => {
          if (!bucket.energies[id]) bucket.energies[id] = [];
          bucket.energies[id].push(kwh);
        });
      });

      return Array.from(buckets.values())
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((bucket) => {
          const point: Record<string, string | number> = { time: bucket.label };
          Object.entries(bucket.energies).forEach(([id, values]) => {
            point[id] = parseFloat(Math.max(...values).toFixed(4));
          });
          return point;
        });
    },
    [history]
  );

  return { history, getHourlyData, getDailyData };
}
