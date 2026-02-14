import { useState, useCallback, useRef, useEffect } from 'react';

export interface Device {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  activeSeconds: number;
  maxActiveMinutes: number;
  powerWatts: number;
  healthyLimitKwh: number;
  totalEnergyKwh: number;
  isExceeding: boolean;
  isCustom?: boolean;
}

const INITIAL_DEVICES: Device[] = [
  {
    id: 'thermostat',
    name: 'Thermostat',
    icon: 'Thermometer',
    isActive: false,
    activeSeconds: 0,
    maxActiveMinutes: 60,
    powerWatts: 500,
    healthyLimitKwh: 2.0,
    totalEnergyKwh: 0,
    isExceeding: false,
  },
  {
    id: 'ac',
    name: 'Air Conditioner',
    icon: 'Wind',
    isActive: false,
    activeSeconds: 0,
    maxActiveMinutes: 120,
    powerWatts: 3500,
    healthyLimitKwh: 8.0,
    totalEnergyKwh: 0,
    isExceeding: false,
  },
  {
    id: 'heater',
    name: 'Electric Heater',
    icon: 'Flame',
    isActive: false,
    activeSeconds: 0,
    maxActiveMinutes: 45,
    powerWatts: 1500,
    healthyLimitKwh: 3.0,
    totalEnergyKwh: 0,
    isExceeding: false,
  },
  {
    id: 'water-heater',
    name: 'Water Heater',
    icon: 'Droplets',
    isActive: false,
    activeSeconds: 0,
    maxActiveMinutes: 30,
    powerWatts: 4500,
    healthyLimitKwh: 5.0,
    totalEnergyKwh: 0,
    isExceeding: false,
  },
];

const DEFAULT_RATE_PER_KWH = 0.15;

function loadRate(): number {
  try {
    const stored = localStorage.getItem('electrack-rate');
    if (stored !== null) {
      const parsed = parseFloat(stored);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
  } catch {}
  return DEFAULT_RATE_PER_KWH;
}

export function useDeviceTracker() {
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [ratePerKwh, setRatePerKwhState] = useState<number>(loadRate);
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  const setRatePerKwh = useCallback((rate: number) => {
    const clamped = Math.max(0, rate);
    setRatePerKwhState(clamped);
    try {
      localStorage.setItem('electrack-rate', String(clamped));
    } catch {}
  }, []);

  const calculateEnergy = (powerWatts: number, seconds: number): number => {
    const hours = seconds / 3600;
    return (powerWatts / 1000) * hours;
  };

  const toggleDevice = useCallback((deviceId: string) => {
    setDevices(prev =>
      prev.map(device => {
        if (device.id !== deviceId) return device;
        return {
          ...device,
          isActive: !device.isActive,
          activeSeconds: !device.isActive ? 0 : device.activeSeconds,
          totalEnergyKwh: device.isActive
            ? device.totalEnergyKwh + calculateEnergy(device.powerWatts, device.activeSeconds)
            : device.totalEnergyKwh,
          isExceeding: false,
        };
      })
    );
  }, []);

  const shutdownDevice = useCallback((deviceId: string) => {
    setDevices(prev =>
      prev.map(device => {
        if (device.id !== deviceId) return device;
        return {
          ...device,
          isActive: false,
          totalEnergyKwh: device.totalEnergyKwh + calculateEnergy(device.powerWatts, device.activeSeconds),
          activeSeconds: 0,
          isExceeding: false,
        };
      })
    );
  }, []);

  const setMaxActiveTime = useCallback((deviceId: string, minutes: number) => {
    setDevices(prev =>
      prev.map(device =>
        device.id === deviceId ? { ...device, maxActiveMinutes: minutes } : device
      )
    );
  }, []);

  const addDevice = useCallback((name: string, powerWatts: number, healthyLimitKwh: number) => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newDevice: Device = {
      id,
      name,
      icon: 'Plug',
      isActive: false,
      activeSeconds: 0,
      maxActiveMinutes: 60,
      powerWatts,
      healthyLimitKwh,
      totalEnergyKwh: 0,
      isExceeding: false,
      isCustom: true,
    };
    setDevices(prev => [...prev, newDevice]);
  }, []);

  const editDevice = useCallback((deviceId: string, updates: { name?: string; powerWatts?: number; healthyLimitKwh?: number }) => {
    setDevices(prev =>
      prev.map(device => {
        if (device.id !== deviceId || !device.isCustom) return device;
        return { ...device, ...updates };
      })
    );
  }, []);

  const removeDevice = useCallback((deviceId: string) => {
    setDevices(prev => prev.filter(device => !(device.id === deviceId && device.isCustom)));
  }, []);
  // Tick active device timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prev =>
        prev.map(device => {
          if (!device.isActive) return device;
          const newSeconds = device.activeSeconds + 1;
          const isExceeding = newSeconds >= device.maxActiveMinutes * 60;
          return {
            ...device,
            activeSeconds: newSeconds,
            isExceeding,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      intervalsRef.current.forEach(interval => clearInterval(interval));
    };
  }, []);

  const totalEnergyUsed = devices.reduce((sum, device) => {
    const currentSessionEnergy = device.isActive
      ? calculateEnergy(device.powerWatts, device.activeSeconds)
      : 0;
    return sum + device.totalEnergyKwh + currentSessionEnergy;
  }, 0);

  const moneySaved = totalEnergyUsed * ratePerKwh;
  const activeDevicesCount = devices.filter(d => d.isActive).length;

  const totalCurrentWatts = devices
    .filter(d => d.isActive)
    .reduce((sum, d) => sum + d.powerWatts, 0);

  const getDeviceCurrentEnergy = (device: Device): number => {
    const currentSessionEnergy = device.isActive
      ? calculateEnergy(device.powerWatts, device.activeSeconds)
      : 0;
    return device.totalEnergyKwh + currentSessionEnergy;
  };

  return {
    devices,
    toggleDevice,
    shutdownDevice,
    setMaxActiveTime,
    addDevice,
    editDevice,
    removeDevice,
    totalEnergyUsed,
    moneySaved,
    activeDevicesCount,
    totalCurrentWatts,
    getDeviceCurrentEnergy,
    ratePerKwh,
    setRatePerKwh,
  };
}
