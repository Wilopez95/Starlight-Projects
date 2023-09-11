import { ObjectSchemaDefinition } from 'yup';

import { ClientRequestType } from '@root/consts';
import { BillableServiceStore } from '@root/stores/billableService/BillableServiceStore';
import { MaterialStore } from '@root/stores/material/MaterialStore';
import { IBusinessContextIds } from '@root/types';

export interface INewClientRequest extends IBusinessContextIds {
  type: ClientRequestType;
  searchString: string;
  customerId: number;
  jobSiteId: number;
  projectId?: number;
  serviceAreaId?: number;
  purchaseOrderId?: number;
}

export interface IValidationData {
  materialStore: MaterialStore;
  billableServiceStore: BillableServiceStore;
  permitRequired: boolean;
  poRequired: boolean;
  additionalOrderFields?: ObjectSchemaDefinition<Record<string, unknown>>;
  additionalServiceFields?: ObjectSchemaDefinition<Record<string, unknown>>;
}
