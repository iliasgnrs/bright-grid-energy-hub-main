import { Thermometer, Wind, Flame, Droplets, Clock, AlertTriangle, Plug } from 'lucide-react';
import type { Device } from '@/hooks/useDeviceTracker';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Thermometer,
  Wind,
  Flame,
  Droplets,
  Plug,
};

interface DeviceCardProps {
  device: Device;
  onToggle: (id: string) => void;
  onClick: (device: Device) => void;
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const DeviceCard = ({ device, onToggle, onClick }: DeviceCardProps) => {
  const IconComponent = iconMap[device.icon] || Plug;
  const isExceeding = device.isExceeding;

  return (
    <div
      className={`group relative cursor-pointer rounded-xl border p-4 transition-all duration-300 sm:p-5 ${
        isExceeding
          ? 'border-danger/50 bg-danger/5 glow-danger'
          : device.isActive
            ? 'border-primary/30 bg-primary/5 glow-primary'
            : 'border-border bg-card hover:border-border/80 hover:bg-card/80'
      }`}
      onClick={() => onClick(device)}
    >
      {/* Exceeding Alert Badge */}
      {isExceeding && (
        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-danger animate-pulse-glow">
          <AlertTriangle className="h-3 w-3 text-danger-foreground" />
        </div>
      )}

      <div className="flex items-start justify-between">
        {/* Icon & Name */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors sm:h-12 sm:w-12 ${
              device.isActive ? 'bg-primary/15' : 'bg-secondary'
            }`}
          >
            <IconComponent
              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                isExceeding
                  ? 'text-danger'
                  : device.isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
              }`}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{device.name}</h3>
            <p
              className={`text-xs font-medium ${
                isExceeding
                  ? 'text-danger'
                  : device.isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
              }`}
            >
              {isExceeding ? 'EXCEEDING LIMIT' : device.isActive ? 'Active' : 'Idle'}
            </p>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(device.id);
          }}
          role="switch"
          aria-checked={device.isActive}
          aria-label={`Toggle ${device.name} ${device.isActive ? 'off' : 'on'}`}
          className={`relative h-7 w-12 rounded-full transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            device.isActive ? 'bg-primary' : 'bg-secondary'
          }`}
        >
          <span
            className={`pointer-events-none absolute top-0.5 block h-6 w-6 rounded-full bg-foreground shadow-lg ring-0 transition-transform duration-300 ease-in-out ${
              device.isActive ? 'translate-x-[1.25rem]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Timer */}
      {device.isActive && (
        <div className="mt-3 flex items-center gap-1.5 rounded-md bg-secondary/50 px-2.5 py-1.5">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className={`font-mono text-sm font-semibold ${isExceeding ? 'text-danger' : 'text-foreground'}`}>
            {formatTime(device.activeSeconds)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            / {device.maxActiveMinutes}m limit
          </span>
        </div>
      )}

      {/* Power draw */}
      <div className="mt-2 text-[11px] text-muted-foreground">
        {device.powerWatts >= 1000
          ? `${(device.powerWatts / 1000).toFixed(1)} kW`
          : `${device.powerWatts} W`}{' '}
        draw
      </div>
    </div>
  );
};

export default DeviceCard;
