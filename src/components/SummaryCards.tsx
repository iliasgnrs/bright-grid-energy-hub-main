import { Battery, DollarSign, Power } from 'lucide-react';

interface SummaryCardsProps {
  totalEnergyUsed: number;
  moneySaved: number;
  activeDevicesCount: number;
}

const SummaryCards = ({ totalEnergyUsed, moneySaved, activeDevicesCount }: SummaryCardsProps) => {
  const cards = [
    {
      label: 'Total Energy Used',
      value: `${totalEnergyUsed.toFixed(3)}`,
      unit: 'kWh',
      icon: Battery,
      accent: 'text-primary',
      bgAccent: 'bg-primary/10',
    },
    {
      label: 'Cost Tracked',
      value: `$${moneySaved.toFixed(2)}`,
      unit: '',
      icon: DollarSign,
      accent: 'text-warning',
      bgAccent: 'bg-warning/10',
    },
    {
      label: 'Active Devices',
      value: `${activeDevicesCount}`,
      unit: '',
      icon: Power,
      accent: activeDevicesCount > 0 ? 'text-primary' : 'text-muted-foreground',
      bgAccent: activeDevicesCount > 0 ? 'bg-primary/10' : 'bg-muted',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="animate-slide-up rounded-xl border border-border bg-card p-3 sm:p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-md ${card.bgAccent}`}>
              <card.icon className={`h-3.5 w-3.5 ${card.accent}`} />
            </div>
          </div>
          <p className={`font-mono text-lg font-bold sm:text-2xl ${card.accent}`}>
            {card.value}
            {card.unit && (
              <span className="ml-1 text-xs font-normal text-muted-foreground">{card.unit}</span>
            )}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{card.label}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
