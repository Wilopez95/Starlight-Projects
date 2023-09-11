import { truckView } from './truck.js';

export const driverView = (driver = {}) => {
  if (!driver) {
    return driver;
  }
  const { truck = {} } = driver;
  return {
    ...driver,
    name: driver.description,
    truck: truckView(truck),
  };
};

export const driversListView = drivers => drivers?.map(driver => driverView(driver));

export default driverView;
