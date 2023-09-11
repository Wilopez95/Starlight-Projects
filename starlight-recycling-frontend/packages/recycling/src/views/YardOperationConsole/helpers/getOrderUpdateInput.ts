import { isNumber, isString, isUndefined, omitBy } from 'lodash-es';
import {
  GetOrderQuery,
  HaulingCustomer,
  HaulingCustomerJobSite,
  HaulingJobSite,
  HaulingMaterial,
  HaulingProject,
  Maybe,
  Order,
  OrderType,
  OrderUpdateInput,
  PaymentMethodType,
} from '../../../graphql/api';
import { BillableItemForFormat, formatBillableItemsToSubmit } from './formatBillableItems';
import { User } from '@starlightpro/common/graphql/api';

export interface OrderValues
  extends Partial<
    Omit<
      Order,
      | 'type'
      | 'status'
      | 'customer'
      | 'material'
      | 'project'
      | 'customerJobSite'
      | 'billableItems'
      | 'bypassScale'
      | 'materialsDistribution'
      | 'miscellaneousMaterialsDistribution'
      | 'amount'
      | 'isAch'
      | 'checkNumber'
      | 'weightTicketCreator'
      | 'emptyWeightUser'
      | 'weightOutUser'
      | 'weightInUser'
      | 'jobSite'
      | 'customerTruck'
      | 'taxTotal'
      | 'taxDistricts'
      | 'originDistrict'
    >
  > {
  id: Order['id'];
  paymentMethod?: Maybe<PaymentMethodType>;
  priceGroupUuid?: Maybe<string>;
  creditCardId?: Maybe<string>;
  bypassScale?: Maybe<boolean>;
  customerTruckId?: Maybe<number>;
  destinationId?: Maybe<number>;
  containerId?: Maybe<number>;
  projectId?: number;
  originDistrictUuid?: Maybe<string>;
  customerJobSiteId?: Maybe<number>;
  type?: Maybe<Order['type']>;
  customer?: Maybe<Pick<HaulingCustomer, 'id'>>;
  material?: Maybe<Pick<HaulingMaterial, 'id'>>;
  project?: Maybe<Pick<HaulingProject, 'id'>>;
  customerJobSite?: Maybe<Pick<HaulingCustomerJobSite, 'id'>>;
  jobSite?: Maybe<Pick<HaulingJobSite, 'id'>>;
  billableItems?: Maybe<BillableItemForFormat[]>;
  materialsDistribution?: GetOrderQuery['order']['materialsDistribution'];
  miscellaneousMaterialsDistribution?: GetOrderQuery['order']['miscellaneousMaterialsDistribution'];
  amount?: Maybe<number>;
  isAch?: Maybe<boolean>;
  checkNumber?: Maybe<string>;
  weightTicketCreator?: Maybe<
    ({ __typename?: 'User' | undefined } & Pick<User, 'firstName' | 'lastName'>) | null | undefined
  >;
  emptyWeightUser?: Maybe<string>;
  weightInUser?: Maybe<string>;
  weightOutUser?: Maybe<string>;
  customerTruck?: Maybe<GetOrderQuery['order']['customerTruck']>;
  taxTotal?: Maybe<number>;
  taxDistricts?: Maybe<GetOrderQuery['order']['taxDistricts']>;
  originDistrict?: Maybe<GetOrderQuery['order']['originDistrict']>;
}

const ensureIsNumber = (value: string | number | null | undefined): number | undefined => {
  if (!isString(value) && !isNumber(value)) {
    return undefined;
  }

  return Number(value);
};

export const getOrderUpdateInput = (values: OrderValues): OrderUpdateInput => {
  const tareWeight = values.containerId
    ? (values.canTare ?? 0) + (values.truckTare ?? 0)
    : values.truckTare;
  const result: OrderUpdateInput = {
    id: values.id,
    PONumber: values.PONumber || null,
    WONumber: values.WONumber || null,
    arrivedAt: values.arrivedAt,
    departureAt: values.departureAt,
    bypassScale: values.bypassScale,
    containerId: values.containerId || values.container?.id || null,
    creditCardId:
      values.paymentMethod === PaymentMethodType.CreditCard ? values.creditCardId : null,

    destinationId: values.destinationId || values.destination?.id || null,
    images: values.images,
    note: values.note,
    originDistrictId: values.originDistrictId,
    paymentMethod: values.paymentMethod,
    customerTruckId: values.customerTruckId || values.customerTruck?.id,
    priceGroupId: values.priceGroupId,
    type: values.type,
    customerId: values.customerId || values.customer?.id,
    projectId: values.projectId || values.project?.id || null,
    materialId: values.material?.id,
    customerJobSiteId: values.customerJobSiteId || values.customerJobSite?.id || null,
    orderBillableItems:
      (values.billableItems && formatBillableItemsToSubmit(values.billableItems)) || undefined,
    useTare: values.useTare,
    truckTare: values.customerTruck?.emptyWeight || values.truckTare,
    canTare: values.canTare,
    weightIn: values.weightIn,
    weightOut:
      values.type === OrderType.Dump && values.useTare
        ? ensureIsNumber(tareWeight)
        : ensureIsNumber(values.weightOut),
    materialsDistributionInput: values.materialsDistribution?.map(
      ({ uuid, value, materialId }) => ({
        uuid,
        materialId,
        value,
      }),
    ),
    miscellaneousMaterialsDistributionInput: values.miscellaneousMaterialsDistribution?.map(
      ({ uuid, quantity, materialId }) => ({
        uuid,
        quantity,
        materialId,
      }),
    ),
    amount: Number(values.amount) || undefined,
    checkNumber: values.checkNumber,
    isAch: values.isAch,
    weightOutUnit: values.weightOutUnit,
    weightOutTimestamp: values.weightOutTimestamp,
    weightOutSource: values.weightOutSource,
    weightOutType: values.weightOutType,
    weightInType: values.weightInType,
    weightInSource: values.weightInSource,
    weightInTimestamp: values.weightInTimestamp,
    weightInUnit: values.weightInUnit,
    jobSiteId: values.jobSite?.id || null,
    taxTotal: values.taxTotal,
    weightScaleUom: values.weightScaleUom,
  };

  return omitBy<OrderUpdateInput>(result, isUndefined) as OrderUpdateInput;
};
