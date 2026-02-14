import { useState, useEffect } from 'react';
import { DollarSign, HelpCircle, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

interface EnergyRateSettingsProps {
  ratePerKwh: number;
  onRateChange: (rate: number) => void;
}

const EnergyRateSettings = ({ ratePerKwh, onRateChange }: EnergyRateSettingsProps) => {
  const [inputValue, setInputValue] = useState(ratePerKwh.toString());
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setInputValue(ratePerKwh.toString());
  }, [ratePerKwh]);

  const validate = (val: string): number | null => {
    if (val.trim() === '') return null;
    const num = parseFloat(val);
    if (isNaN(num)) return null;
    if (num < 0) return null;
    if (num > 10) return null;
    return num;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setSaved(false);

    if (val.trim() === '') {
      setError('Rate is required');
      return;
    }

    const parsed = validate(val);
    if (parsed === null) {
      setError('Enter a valid number (0–10)');
      return;
    }

    setError('');
  };

  const handleBlur = () => {
    const parsed = validate(inputValue);
    if (parsed !== null && parsed !== ratePerKwh) {
      onRateChange(parsed);
      setSaved(true);
      toast({
        title: 'Rate Updated',
        description: `Energy rate set to $${parsed.toFixed(2)}/kWh`,
      });
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-warning/10">
          <DollarSign className="h-3.5 w-3.5 text-warning" />
        </div>
        <Label htmlFor="energy-rate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Set Energy Rate Cost
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Learn about energy rate"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[220px]">
            <p className="text-xs">
              Set your local electricity rate per kilowatt-hour. This affects all cost calculations across your dashboard.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">$</span>
        <Input
          id="energy-rate"
          type="number"
          step="0.01"
          min="0"
          max="10"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-label="Energy rate in dollars per kilowatt-hour"
          aria-describedby="rate-help"
          aria-invalid={!!error}
          className="h-9 font-mono text-sm max-w-[120px]"
        />
        <span className="text-xs text-muted-foreground">/kWh</span>

        {saved && (
          <div className="flex items-center gap-1 text-primary animate-slide-up">
            <Check className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Saved</span>
          </div>
        )}
      </div>

      {error && (
        <p id="rate-help" className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default EnergyRateSettings;
