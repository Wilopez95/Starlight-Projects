import { ISelectOption } from '@starlightpro/shared-components';

import { ITruckAndDriverCost } from '@root/types';

export interface IConfirmTruckAndDriverCostExist {
  isOpen: boolean;
  date: Date;
  businessUnitId: number | null;
  businessUnitOptions: ISelectOption[];
  onClose(): void;
  openWarningModal(): void;
  onDuplicate(): void;
  setValuesForDuplicating(data: ITruckAndDriverCost): void;
}

export interface IConfirmTruckAndDriverCostData {
  businessUnitId: number | null;
  date: Date;
}
