import { useEffect, useState } from 'react';
import { X, Power, AlertTriangle, Gauge, Clock, Zap, Pencil, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Device } from '@/hooks/useDeviceTracker';

interface DeviceModalProps {
  device: Device | null;
  onClose: () => void;
  onShutdown: (id: string) => void;
  onSetMaxTime: (id: string, minutes: number) => void;
  onEdit?: (id: string, updates: { name?: string; powerWatts?: number; healthyLimitKwh?: number }) => void;
  onRemove?: (id: string) => void;
  getDeviceCurrentEnergy: (device: Device) => number;
  ratePerKwh: number;
}

const DeviceModal = ({
  device,
  onClose,
  onShutdown,
  onSetMaxTime,
  onEdit,
  onRemove,
  getDeviceCurrentEnergy,
  ratePerKwh,
}: DeviceModalProps) => {
  const [localMaxMinutes, setLocalMaxMinutes] = useState(30);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPower, setEditPower] = useState('');
  const [editLimit, setEditLimit] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (device) {
      setLocalMaxMinutes(device.maxActiveMinutes);
      setEditName(device.name);
      setEditPower(String(device.powerWatts));
      setEditLimit(String(device.healthyLimitKwh));
      setIsEditing(false);
      setConfirmDelete(false);
    }
  }, [device]);

  if (!device) return null;

  const currentEnergy = getDeviceCurrentEnergy(device);
  const usagePercent = Math.min((currentEnergy / device.healthyLimitKwh) * 100, 100);
  const isOverLimit = currentEnergy > device.healthyLimitKwh;
  const activeMinutes = Math.floor(device.activeSeconds / 60);
  const timeLimitPercent = device.isActive
    ? Math.min((device.activeSeconds / (device.maxActiveMinutes * 60)) * 100, 100)
    : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setLocalMaxMinutes(val);
    onSetMaxTime(device.id, val);
  };

  const handleSaveEdit = () => {
    const trimmedName = editName.trim();
    const watts = parseFloat(editPower);
    const limit = parseFloat(editLimit);

    if (!trimmedName || trimmedName.length > 50) {
      toast.error('Name must be 1–50 characters');
      return;
    }
    if (isNaN(watts) || watts < 1 || watts > 50000) {
      toast.error('Power must be 1–50,000 W');
      return;
    }
    if (isNaN(limit) || limit < 0.01 || limit > 1000) {
      toast.error('Limit must be 0.01–1,000 kWh');
      return;
    }

    onEdit?.(device.id, { name: trimmedName, powerWatts: watts, healthyLimitKwh: limit });
    toast.success('Device updated');
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onRemove?.(device.id);
    toast.success(`${device.name} removed`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg animate-slide-up rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={50}
                className="w-full rounded-lg border border-primary bg-secondary/30 px-3 py-1.5 text-lg font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            ) : (
              <>
                <h2 className="text-lg font-bold text-foreground">{device.name}</h2>
                <p className={`text-xs font-medium ${device.isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {device.isActive ? 'Currently Active' : 'Currently Idle'}
                  {device.isCustom && <span className="ml-2 text-muted-foreground">• Custom</span>}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {device.isCustom && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
                  aria-label="Edit device"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    confirmDelete
                      ? 'bg-danger text-danger-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-danger'
                  }`}
                  aria-label={confirmDelete ? 'Confirm delete' : 'Delete device'}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            {isEditing && (
              <button
                onClick={handleSaveEdit}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                aria-label="Save changes"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => { setIsEditing(false); setConfirmDelete(false); onClose(); }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Edit Fields for Power & Limit */}
        {isEditing && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Power (W)</label>
              <input
                type="number"
                value={editPower}
                onChange={(e) => setEditPower(e.target.value)}
                min={1}
                max={50000}
                className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Healthy Limit (kWh)</label>
              <input
                type="number"
                value={editLimit}
                onChange={(e) => setEditLimit(e.target.value)}
                min={0.01}
                max={1000}
                step={0.01}
                className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Confirm delete message */}
        {confirmDelete && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Click the trash icon again to permanently remove this device.</span>
          </div>
        )}

        {/* Energy Usage vs Healthy Limit */}
        <div className="mb-4 rounded-xl border border-border bg-secondary/30 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Energy vs Healthy Limit</span>
            </div>
            <span className={`font-mono text-sm font-bold ${isOverLimit ? 'text-danger' : 'text-primary'}`}>
              {currentEnergy.toFixed(3)} / {device.healthyLimitKwh} kWh
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverLimit ? 'bg-danger' : usagePercent > 75 ? 'bg-warning' : 'bg-primary'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          {isOverLimit && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-danger">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-medium">Exceeding healthy energy limit!</span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
            <Zap className="mx-auto mb-1 h-4 w-4 text-primary" />
            <p className="font-mono text-sm font-bold text-foreground">
              {device.powerWatts >= 1000
                ? `${(device.powerWatts / 1000).toFixed(1)}kW`
                : `${device.powerWatts}W`}
            </p>
            <p className="text-[10px] text-muted-foreground">Power Draw</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
            <Clock className="mx-auto mb-1 h-4 w-4 text-warning" />
            <p className="font-mono text-sm font-bold text-foreground">{activeMinutes}m</p>
            <p className="text-[10px] text-muted-foreground">Active Time</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
            <Gauge className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
            <p className="font-mono text-sm font-bold text-foreground">
              ${(currentEnergy * ratePerKwh).toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground">Session Cost</p>
          </div>
        </div>

        {/* Time Limit Slider */}
        <div className="mb-4 rounded-xl border border-border bg-secondary/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Max Active Time</span>
            <span className="font-mono text-sm font-bold text-foreground">{localMaxMinutes} min</span>
          </div>
          <input
            type="range"
            min={5}
            max={240}
            step={5}
            value={localMaxMinutes}
            onChange={handleSliderChange}
            className="w-full accent-primary"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>5 min</span>
            <span>240 min</span>
          </div>

          {device.isActive && (
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    device.isExceeding ? 'bg-danger' : timeLimitPercent > 75 ? 'bg-warning' : 'bg-primary'
                  }`}
                  style={{ width: `${timeLimitPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Emergency Kill Switch */}
        <button
          onClick={() => {
            onShutdown(device.id);
            onClose();
          }}
          disabled={!device.isActive}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
            device.isActive
              ? 'bg-danger text-danger-foreground glow-danger hover:bg-danger/90'
              : 'cursor-not-allowed bg-secondary text-muted-foreground'
          }`}
        >
          <Power className="h-4 w-4" />
          Shut Down Device
        </button>
      </div>
    </div>
  );
};

export default DeviceModal;
