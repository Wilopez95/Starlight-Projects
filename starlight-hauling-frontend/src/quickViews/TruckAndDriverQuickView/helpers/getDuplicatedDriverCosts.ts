import { IDriver, IDriverCost } from '@root/types';

export const getDuplicatedDriverCosts = (drivers?: IDriver[], driverCosts?: IDriverCost[] | null) =>
  driverCosts?.filter(driverCost => drivers?.find(driver => driverCost.driverId === driver.id));
