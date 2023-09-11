import { FindOperator } from 'typeorm';

type ITypeormValidation = FindOperator<unknown>;
export interface IWhere {
  thirdPartyHaulerId?: ITypeormValidation;
  csrName?: string | null | ITypeormValidation;
  originalId?: number | null;
  skip?: number | null;
  businessLineId?: number | null | ITypeormValidation;
  businessUnitId?: number | string | null;
  id?: number | null | ITypeormValidation;
  type?: string | null;
  serviceAreaIds?: number[] | null | ITypeormValidation;
  limit?: number | null;
  customerGroupId?: number | null | ITypeormValidation;
  customerJobSiteId?: number | null | ITypeormValidation;
  status?: string | null | ITypeormValidation;
  csrEmail?: string | null;
  customerId?: number | null | ITypeormValidation;
  originalCustomerId?: number | number | null;
  disposalSiteId?: number | null | ITypeormValidation;
  workOrderId?: number | null;
  customRatesGroupId?: number | number | null;
  active?: boolean | null;
  orderId?: number | null | ITypeormValidation;
  billingCycle?: string | null | ITypeormValidation;
  serviceDate?: string | Date | null | ITypeormValidation;
  serviceFrequencyId?: number[] | null | ITypeormValidation;
  take?: number | null;
  serviceAreaId?: number | null;
  paymentMethod?: string | null | ITypeormValidation;
  billableServiceId?: number | null | ITypeormValidation;
  highPriority?: boolean | null;
  materialId?: number | null | ITypeormValidation;
  nextBillingPeriodTo?: FindOperator<string> | string | null;
  billingType?: FindOperator<string> | string | null;
}

export interface IBody {
  order?: ISort;
  take?: number | null;
  skip?: number | null;
  where?: IWhere;
  select?: string[];
}

export interface ISort {
  [key: string]: string | number;
}

export type IOrderBy = 'ASC' | 'DESC';
