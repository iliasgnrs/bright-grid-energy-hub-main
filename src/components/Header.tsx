import { Zap, Activity } from 'lucide-react';

interface HeaderProps {
  totalCurrentWatts: number;
}

const Header = ({ totalCurrentWatts }: HeaderProps) => {
  const formattedWatts = totalCurrentWatts >= 1000
    ? `${(totalCurrentWatts / 1000).toFixed(1)} kW`
    : `${totalCurrentWatts} W`;

  return (
    <header className="relative border-b border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Branding */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 glow-primary">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
                Save Now
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Bright Grid • ElecTrack
              </p>
            </div>
          </div>

          {/* Live Status */}
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 sm:px-4 sm:py-2">
            <Activity className={`h-3.5 w-3.5 ${totalCurrentWatts > 0 ? 'text-primary animate-pulse-glow' : 'text-muted-foreground'}`} />
            <span className="font-mono text-sm font-semibold text-foreground sm:text-base">
              {formattedWatts}
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">live</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
