import axios, { AxiosResponse } from 'axios';
import { Logger } from 'pino';

import Order, { OrderStatus, OrderType } from '../../modules/recycling/entities/Order';
import { createToken } from '../../utils/serviceToken';
import { AMQP_QUEUE_INVOICED_ORDERS_TO_RECYCLING, CORE_SERVICE_API_URL } from '../../config';
import {
  HaulingOrder,
  HaulingOrderPayment,
  HaulingOrderStatus,
  HaulingPaymentMethod,
} from './types/HaulingOrder';
import { logger as serviceLogger } from '../logger';
import { getBusinessUnit } from './business_units';
import { HaulingHttpCrudService, PartialContext } from '../../graphql/createHaulingCRUDResolver';
import { parseFacilitySrn } from '../../utils/srn';
import { observeOn } from '../queue';
import { map, share } from 'rxjs/operators';

export interface InvoicedOrdersEvent {
  schemaName: string;
  orderIds: number[];
  customerId: number;
  businessUnitId: number;
  userId: string;
}

export const invoicedOrdersObservable = observeOn<InvoicedOrdersEvent>({
  type: AMQP_QUEUE_INVOICED_ORDERS_TO_RECYCLING,
  assertQueue: true,
}).pipe(
  map((message) => message.payload),
  share(),
);
import { QueryContext } from 'src/types/QueryContext';

interface GetOrCreateOrderFromHaulingOrder {
  haulingOrder: HaulingOrder;
  CtxOrder: typeof Order;
  forceCreate?: boolean;
}

export const getHaulingOrder = async (
  id: number,
  tenantName: string,
  reqId: string,
  logger: Logger = serviceLogger,
): Promise<HaulingOrder> => {
  try {
    const CustomerResponse = await axios.get(`${CORE_SERVICE_API_URL}/orders/${id}`, {
      headers: {
        Authorization: `ServiceToken ${await createToken(
          {
            schemaName: tenantName,
            subscriberName: tenantName,
            permissions: ['orders:view-all:perform', 'orders:view-own:perform'],
          },
          { audience: 'billing', subject: 'recycling', requestId: reqId },
        )}`,
      },
    });

    return CustomerResponse.data;
  } catch (e) {
    logger.error(`Failed to fetch hauling order with ID ${id}: ${e.message}`, e);

    throw e;
  }
};

export const getOrCreateOrderFromHaulingOrder = async ({
  haulingOrder,
  CtxOrder,
  forceCreate = false,
}: GetOrCreateOrderFromHaulingOrder): Promise<Order> => {
  const {
    id: haulingOrderId,
    workOrder: { woNumber },
    purchaseOrder: { poNumber: PONumber } = {},
  } = haulingOrder;

  if (!forceCreate) {
    const existingOrder = await CtxOrder.findOne({ truckOnWayId: haulingOrderId });

    // at this point no updates to order values come from hauling after it's created
    if (existingOrder) {
      return existingOrder;
    }
  }

  const orderValuesFromHauling: Partial<Order> = {
    type: OrderType.DUMP,
    status: OrderStatus.ON_THE_WAY,
    WONumber: `${woNumber}`,
    truckOnWayId: haulingOrderId,
    PONumber,
  };

  const order = CtxOrder.create(orderValuesFromHauling);

  return order;
};

interface HaulingOrderPaymentInput {
  paymentMethod: HaulingPaymentMethod;
  amount: number;
  checkNumber?: string | null;
  isAch?: boolean;
  creditCardId?: string | null;
}

export interface HaulingOrdersInput {
  customerId: number;
  businessUnitId: number | string;
  businessLineId: number;
  orders: Array<HaulingOrderInput | HaulingOrderNonServiceInput>;
  payments: Array<HaulingOrderPaymentInput>;
}

export interface OrderThresholdInput {
  thresholdId: number;
  globalRatesThresholdsId: number;
  customRatesGroupThresholdsId: number | null;
  price: number;
  quantity: number;
  applySurcharges: boolean;
}

export interface OrderThresholdUpdateInput extends OrderThresholdInput {
  id: number;
  threshold: {
    id: number;
    originalId: number;
  };
}

export interface HaulingOrderNonServiceInput {
  recycling: boolean;
  noBillableService: boolean;
  serviceAreaId?: number | null;
  projectId?: number;
  route?: string | null;
  notifyDayBefore: 'byText' | 'byEmail' | null;
  jobSiteId?: number;
  customRatesGroupId?: number;
  callOnWayPhoneNumber?: string | null;
  textOnWayPhoneNumber?: string | null;
  callOnWayPhoneNumberId?: number | null;
  textOnWayPhoneNumberId?: number | null;
  signatureRequired: boolean;
  thirdPartyHaulerId?: number | null;
  alleyPlacement: boolean;
  cabOver: boolean;
  applySurcharges: boolean;
  poRequired: boolean;
  permitRequired: boolean;
  popupNote: string | null;
  serviceDate: Date;
  grandTotal?: number;
  oneTimePurchaseOrderNumber?: string | null;
  purchaseOrderId?: number | null;
  lineItems?: Array<{
    billableLineItemId: number;
    materialId: number | null;
    globalRatesLineItemsId: number;
    customRatesGroupLineItemsId?: number;
    price: number;
    quantity: number;
    applySurcharges: boolean;
  }>;
  jobSiteNote?: string;
  driverInstructions?: string;
  billableServiceQuantity: number;
}

export interface HaulingOrderInput extends HaulingOrderNonServiceInput {
  billableServiceId: number;
  equipmentItemId?: number;
  materialId?: number;
  billableServicePrice: number;
  billableServiceApplySurcharges: boolean;
  globalRatesServicesId: number;
  customRatesGroupServicesId?: number;
  jobSiteContactId: number;
  permitId?: number;
  purchaseOrder?: string;
  bestTimeToComeFrom?: string;
  bestTimeToComeTo?: string;
  someoneOnSite?: boolean;
  toRoll?: boolean;
  highPriority?: boolean;
  earlyPick?: boolean;
  orderContactId?: number;
  materialProfileId?: number | null;
  disposalSiteId?: number | null;
  promoId?: number | null;
  originDistrictId?: number | null;
  orderRequestMediaUrls?: string[] | null;
  thresholds?: Array<OrderThresholdInput>;
}

interface HaulingOrderPaymentUpdateInput extends Omit<HaulingOrderPayment, 'id'> {
  paymentId: number;
}

export interface UpdateHaulingOrderInput
  extends Omit<
    HaulingOrderInput | HaulingOrderNonServiceInput,
    | 'signatureRequired'
    | 'alleyPlacement'
    | 'cabOver'
    | 'poRequired'
    | 'permitRequired'
    | 'popupNote'
  > {
  id: number;
  status: HaulingOrderStatus;
  payments?: Array<HaulingOrderPaymentUpdateInput> | null;
  thresholds?: OrderThresholdUpdateInput[];
}

export class HaulingOrderHttpService extends HaulingHttpCrudService<
  HaulingOrder,
  HaulingOrdersInput,
  UpdateHaulingOrderInput
> {
  path = 'orders';

  async create(
    ctx: PartialContext,
    data: Omit<HaulingOrdersInput, 'businessUnitId' | 'businessLineId'>,
    authorization?: string,
    permissions?: string[],
  ): Promise<HaulingOrder> {
    const businessUnit = await getBusinessUnit(ctx, authorization);
    const businessLine = businessUnit.businessLines[0];

    if (!businessUnit) {
      throw new Error('Failed to get business unit');
    }

    return super.create(
      ctx,
      { businessUnitId: businessUnit.id, businessLineId: businessLine.id, ...data },
      authorization,
      {
        userId: ctx.userInfo.id,
        email: ctx.userInfo.email,
        tenantId: ctx.userInfo.tenantId,
        permissions,
      },
    );
  }

  async update(
    ctx: PartialContext,
    data: UpdateHaulingOrderInput,
    authorization?: string,
    tokenPayload?: Record<string, any>,
  ): Promise<HaulingOrder> {
    return super.update(ctx, data, authorization, {
      ...tokenPayload,
      userId: ctx.userInfo.id,
      email: ctx.userInfo.email,
      tenantId: ctx.userInfo.tenantId,
      permissions: ['orders:edit:perform'],
    });
  }

  async unApprove(
    ctx: PartialContext,
    id: number,
    comment: string | null,
    authorization?: string,
    tokenPayload?: Record<string, any>,
  ): Promise<AxiosResponse<boolean>> {
    const { businessUnitId } = parseFacilitySrn(ctx.userInfo.resource!);

    return super.makeRequest({
      data: { businessUnitId, comment },
      ctx,
      authorization,
      tokenPayload,
      params: { businessUnitId },
      method: 'POST',
      url: `${CORE_SERVICE_API_URL}/${this.path}/${id}/unapprove`,
    });
  }

  async unFinalize(
    ctx: PartialContext,
    id: number,
    comment: string | null,
    authorization?: string,
    tokenPayload?: Record<string, any>,
  ): Promise<AxiosResponse<boolean>> {
    const { businessUnitId } = parseFacilitySrn(ctx.userInfo.resource!);

    return super.makeRequest({
      data: { businessUnitId, comment },
      ctx,
      authorization,
      tokenPayload,
      params: { businessUnitId },
      method: 'POST',
      url: `${CORE_SERVICE_API_URL}/${this.path}/${id}/unfinalize`,
    });
  }

  async approveOrders(
    ctx: PartialContext,
    ids: number[] | null,
    authorization?: string,
    tokenPayload?: Record<string, any>,
  ): Promise<AxiosResponse<boolean>> {
    const { businessUnitId } = parseFacilitySrn(ctx.userInfo.resource!);

    return super.makeRequest({
      data: { ids, businessUnitId, validOnly: false },
      ctx,
      authorization,
      tokenPayload,
      params: { businessUnitId },
      method: 'POST',
      url: `${CORE_SERVICE_API_URL}/${this.path}/approve`,
    });
  }

  async finalizeOrders(
    ctx: PartialContext,
    ids: number[] | null,
    authorization?: string,
    tokenPayload?: Record<string, any>,
  ): Promise<AxiosResponse<boolean>> {
    const { businessUnitId } = parseFacilitySrn(ctx.userInfo.resource!);

    return super.makeRequest({
      data: { ids, businessUnitId, validOnly: false },
      ctx,
      authorization,
      tokenPayload,
      method: 'POST',
      params: { businessUnitId },
      url: `${CORE_SERVICE_API_URL}/${this.path}/finalize`,
    });
  }

  async getHistory(ctx: QueryContext, orderId: number, authorization?: string) {
    return super.makeRequest({
      ctx,
      authorization,
      url: `${CORE_SERVICE_API_URL}/orders/${orderId}/history`,
    });
  }
}

export const orderService = new HaulingOrderHttpService();
