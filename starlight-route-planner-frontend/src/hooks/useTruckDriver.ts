import { useEffect, useState } from 'react';

import { IHaulingDriver, IHaulingTruck } from '@root/types';

import { useStores } from './useStores';

interface Params {
  truckId?: number | string | null;
  driverId?: number | string | null;
}

export const useTruckDriver = ({ truckId, driverId }: Params) => {
  const [truck, setTruck] = useState<IHaulingTruck | null>(null);
  const [driver, setDriver] = useState<IHaulingDriver | null>(null);
  const { haulingDriversStore, haulingTrucksStore } = useStores();

  useEffect(() => {
    (async () => {
      if (!truckId && !driverId) {
        return;
      }

      const services = [];

      if (truckId) {
        services.push(haulingTrucksStore.getHaulingTruck(+truckId));
      } else {
        services.push(Promise.resolve());
      }

      if (driverId) {
        services.push(haulingDriversStore.getHaulingDriver(+driverId));
      } else {
        services.push(Promise.resolve());
      }

      const [_truck, _driver] = await Promise.all(services);

      !!_truck && setTruck(_truck as IHaulingTruck);
      !!_driver && setDriver(_driver as IHaulingDriver);
    })();
  }, [truckId, driverId, haulingTrucksStore, haulingDriversStore]);

  return {
    truck,
    driver,
  };
};
