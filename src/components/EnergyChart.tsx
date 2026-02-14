import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart3, Clock, CalendarDays } from 'lucide-react';
import type { Device } from '@/hooks/useDeviceTracker';

interface EnergyChartProps {
  devices: Device[];
  getHourlyData: (hoursBack?: number) => Record<string, string | number>[];
  getDailyData: (daysBack?: number) => Record<string, string | number>[];
}

const DEVICE_COLORS: Record<string, string> = {
  thermostat: 'hsl(142, 71%, 45%)',
  ac: 'hsl(200, 80%, 55%)',
  heater: 'hsl(25, 90%, 55%)',
  'water-heater': 'hsl(270, 60%, 60%)',
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl">
      <p className="mb-1.5 text-xs font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono-data font-medium text-foreground">
            {entry.value.toFixed(4)} kWh
          </span>
        </div>
      ))}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
    <BarChart3 className="h-8 w-8 opacity-40" />
    <p className="text-sm">No energy data yet</p>
    <p className="text-xs opacity-70">Toggle devices on to start recording</p>
  </div>
);

const EnergyChart = ({ devices, getHourlyData, getDailyData }: EnergyChartProps) => {
  const [view, setView] = useState<'daily' | 'weekly'>('daily');

  const hourlyData = useMemo(() => getHourlyData(24), [getHourlyData]);
  const dailyData = useMemo(() => getDailyData(7), [getDailyData]);

  const chartData = view === 'daily' ? hourlyData : dailyData;

  const deviceMap = useMemo(() => {
    const map: Record<string, string> = {};
    devices.forEach((d) => {
      map[d.id] = d.name;
    });
    return map;
  }, [devices]);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <BarChart3 className="h-4 w-4 text-primary" />
            Energy Usage History
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs value={view} onValueChange={(v) => setView(v as 'daily' | 'weekly')}>
          <TabsList className="mb-4 w-full bg-secondary">
            <TabsTrigger
              value="daily"
              className="flex-1 gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Clock className="h-3.5 w-3.5" />
              Last 24h
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="flex-1 gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Last 7 Days
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-0">
            {hourlyData.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData} barCategoryGap="20%">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(150, 10%, 15%)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10, fill: 'hsl(150, 8%, 50%)' }}
                      axisLine={{ stroke: 'hsl(150, 10%, 15%)' }}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'hsl(150, 8%, 50%)' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}`}
                      label={{
                        value: 'kWh',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fontSize: 10, fill: 'hsl(150, 8%, 50%)' },
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(150, 10%, 12%)' }} />
                    <Legend
                      formatter={(value: string) => (
                        <span className="text-xs text-muted-foreground">
                          {deviceMap[value] || value}
                        </span>
                      )}
                    />
                    {devices.map((device) => (
                      <Bar
                        key={device.id}
                        dataKey={device.id}
                        name={device.id}
                        fill={DEVICE_COLORS[device.id] || 'hsl(142, 71%, 45%)'}
                        radius={[3, 3, 0, 0]}
                        maxBarSize={32}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="mt-0">
            {dailyData.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} barCategoryGap="20%">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(150, 10%, 15%)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10, fill: 'hsl(150, 8%, 50%)' }}
                      axisLine={{ stroke: 'hsl(150, 10%, 15%)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'hsl(150, 8%, 50%)' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}`}
                      label={{
                        value: 'kWh',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fontSize: 10, fill: 'hsl(150, 8%, 50%)' },
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(150, 10%, 12%)' }} />
                    <Legend
                      formatter={(value: string) => (
                        <span className="text-xs text-muted-foreground">
                          {deviceMap[value] || value}
                        </span>
                      )}
                    />
                    {devices.map((device) => (
                      <Bar
                        key={device.id}
                        dataKey={device.id}
                        name={device.id}
                        fill={DEVICE_COLORS[device.id] || 'hsl(142, 71%, 45%)'}
                        radius={[3, 3, 0, 0]}
                        maxBarSize={48}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnergyChart;
