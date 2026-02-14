import { useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '@/components/Header';
import SummaryCards from '@/components/SummaryCards';
import DeviceCard from '@/components/DeviceCard';
import DeviceModal from '@/components/DeviceModal';
import AddDeviceForm from '@/components/AddDeviceForm';
import EnergyRateSettings from '@/components/EnergyRateSettings';
import EnergyChart from '@/components/EnergyChart';
import { useDeviceTracker, type Device } from '@/hooks/useDeviceTracker';
import { useDeviceNotifications } from '@/hooks/useDeviceNotifications';
import { useEnergyHistory } from '@/hooks/useEnergyHistory';

const Index = () => {
  const {
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
  } = useDeviceTracker();

  useDeviceNotifications(devices);
  const { getHourlyData, getDailyData } = useEnergyHistory(devices, getDeviceCurrentEnergy);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const liveSelectedDevice = selectedDevice
    ? devices.find(d => d.id === selectedDevice.id) || null
    : null;

  return (
    <div className="relative min-h-screen bg-background bg-grid-pattern">
      <Header totalCurrentWatts={totalCurrentWatts} />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Summary */}
        <section className="mb-6 sm:mb-8">
          <SummaryCards
            totalEnergyUsed={totalEnergyUsed}
            moneySaved={moneySaved}
            activeDevicesCount={activeDevicesCount}
          />
        </section>

        {/* Devices Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Your Devices
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Device
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onToggle={toggleDevice}
                onClick={setSelectedDevice}
              />
            ))}
          </div>
        </section>

        {/* Energy Usage Chart */}
        <section className="mt-6 sm:mt-8">
          <EnergyChart
            devices={devices}
            getHourlyData={getHourlyData}
            getDailyData={getDailyData}
          />
        </section>

        {/* Energy Rate Settings */}
        <section className="mt-6 sm:mt-8">
          <EnergyRateSettings ratePerKwh={ratePerKwh} onRateChange={setRatePerKwh} />
        </section>

        {/* Rate info */}
        <footer className="mt-6 text-center text-[11px] text-muted-foreground">
          <p>Current rate: ${ratePerKwh.toFixed(2)}/kWh • Powered by Bright Grid</p>
        </footer>
      </main>

      {/* Device Detail Modal */}
      <DeviceModal
        device={liveSelectedDevice}
        onClose={() => setSelectedDevice(null)}
        onShutdown={shutdownDevice}
        onSetMaxTime={setMaxActiveTime}
        onEdit={editDevice}
        onRemove={removeDevice}
        getDeviceCurrentEnergy={getDeviceCurrentEnergy}
        ratePerKwh={ratePerKwh}
      />

      {/* Add Device Form */}
      <AddDeviceForm
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAdd={addDevice}
      />
    </div>
  );
};

export default Index;
