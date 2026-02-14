import { useState } from 'react';
import { X, Plus, Zap, Gauge, PlugZap } from 'lucide-react';
import { toast } from 'sonner';

interface AddDeviceFormProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, powerWatts: number, healthyLimitKwh: number) => void;
}

const AddDeviceForm = ({ open, onClose, onAdd }: AddDeviceFormProps) => {
  const [name, setName] = useState('');
  const [powerWatts, setPowerWatts] = useState('');
  const [healthyLimit, setHealthyLimit] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Device name is required';
    } else if (trimmedName.length > 50) {
      newErrors.name = 'Name must be under 50 characters';
    }

    const watts = parseFloat(powerWatts);
    if (!powerWatts || isNaN(watts)) {
      newErrors.powerWatts = 'Enter a valid number';
    } else if (watts < 1 || watts > 50000) {
      newErrors.powerWatts = 'Must be between 1 and 50,000 W';
    }

    const limit = parseFloat(healthyLimit);
    if (!healthyLimit || isNaN(limit)) {
      newErrors.healthyLimit = 'Enter a valid number';
    } else if (limit < 0.01 || limit > 1000) {
      newErrors.healthyLimit = 'Must be between 0.01 and 1,000 kWh';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onAdd(name.trim(), parseFloat(powerWatts), parseFloat(healthyLimit));
    toast.success(`${name.trim()} added to your devices`);
    setName('');
    setPowerWatts('');
    setHealthyLimit('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md animate-slide-up rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
              <PlugZap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Add Device</h2>
              <p className="text-xs text-muted-foreground">Create a custom device to track</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Device Name */}
          <div>
            <label htmlFor="device-name" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Device Name
            </label>
            <input
              id="device-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Washing Machine"
              maxLength={50}
              className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
          </div>

          {/* Power Rating */}
          <div>
            <label htmlFor="device-power" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Zap className="h-3 w-3" />
              Power Rating (Watts)
            </label>
            <input
              id="device-power"
              type="number"
              value={powerWatts}
              onChange={(e) => setPowerWatts(e.target.value)}
              placeholder="e.g. 2000"
              min={1}
              max={50000}
              className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.powerWatts && <p className="mt-1 text-xs text-danger">{errors.powerWatts}</p>}
          </div>

          {/* Healthy Limit */}
          <div>
            <label htmlFor="device-limit" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Gauge className="h-3 w-3" />
              Healthy Limit (kWh)
            </label>
            <input
              id="device-limit"
              type="number"
              value={healthyLimit}
              onChange={(e) => setHealthyLimit(e.target.value)}
              placeholder="e.g. 5.0"
              min={0.01}
              max={1000}
              step={0.01}
              className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.healthyLimit && <p className="mt-1 text-xs text-danger">{errors.healthyLimit}</p>}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all duration-200 hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Device
        </button>
      </div>
    </div>
  );
};

export default AddDeviceForm;
