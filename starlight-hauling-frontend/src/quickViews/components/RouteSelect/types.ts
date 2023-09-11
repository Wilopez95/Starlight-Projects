import { ISelect } from '@starlightpro/shared-components';

import { BusinessLineType } from '@root/consts';

export type IRouteSelect = Omit<ISelect, 'options'> & {
  serviceDate: Date;
  serviceAreaId: number;
  businessLineType?: BusinessLineType;
};
