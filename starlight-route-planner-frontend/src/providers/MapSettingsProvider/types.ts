import { WayPointType } from '@root/consts';

export type ItemsToShow = {
  [WayPointType.HOME_YARD]: boolean;
  [WayPointType.LANDFILL]: boolean;
};
