import {
  Arg,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  Float,
  Info,
  InputType,
  Int,
  Maybe,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { ApolloError } from 'apollo-server-koa';
import { FindConditions, FindManyOptions, In, IsNull, Not, UpdateResult } from 'typeorm';

import { groupBy, isNil, keyBy, pick, round, sortBy, sum } from 'lodash';
import { v4 as uuidV4 } from 'uuid';
import Order, { OrderImage, OrderStatus, OrderType, PaymentMethodType } from '../../entities/Order';
import {
  OrderBillableItem,
  OrderBillableItemInput,
  OrderBillableItemType,
  OrderPriceSourceType,
} from '../../entities/OrderBillableItem';
import {
  GradingPayloadInput,
  OrderMaterialDistributionInput,
  OrderMiscellaneousMaterialDistributionInput,
} from '../types/GradingPayload';
import CustomerTruck from '../../entities/CustomerTruck';
import { HaulingCustomerJobSite } from '../../entities/CustomerJobSite';
import { QueryContext } from '../../../../types/QueryContext';
import { createCRUDResolver } from '../../../../graphql/createCRUDResolver';
import getContextualizedEntity from '../../../../utils/getContextualizedEntity';
import {
  getOrCreateOrderFromHaulingOrder,
  HaulingOrderInput as HaulingOrderInputType,
  HaulingOrderNonServiceInput,
  orderService,
  OrderThresholdUpdateInput,
  UpdateHaulingOrderInput,
} from '../../../../services/core/haulingOrder';
import { Context } from '../../../../types/Context';
import { OrderMaterialDistribution } from '../../entities/OrderMaterialDistribution';
import { OrderMiscellaneousMaterialDistribution } from '../../entities/OrderMiscellaneousMaterialDistribution';
import { GraphQLResolveInfo } from 'graphql';
import { getUser, User } from '../../../../services/ums/users';
import { sendEmailWithAttachments } from '../../../../services/email';
import { filesUploadService } from '../../../../services/fileUpload';
import { getBusinessUnit } from '../../../../services/core/business_units';
import { MeasurementType, MeasurementUnit } from '../types/Measurements';
import { getCustomer } from '../../../../services/core/haulingCustomer';
import {
  HaulingCustomer,
  HaulingCustomerStatus,
} from '../../../../services/core/types/HaulingCustomer';
import {
  getHaulingCustomerJobSite,
  getHaulingCustomerJobSitePair,
} from '../../../../services/core/haulingJobSite';
import { getHaulingProject } from '../../../../services/core/haulingProject';
import { HaulingMaterial } from '../../../../services/core/types/HaulingMaterial';
import { getHaulingMaterial, materialService } from '../../../../services/core/haulingMaterials';
import { httpBillableService } from '../../../../services/core/billableService';
import {
  BillableLineItemInput,
  BillableServiceCalculateInput,
  CreateHaulingOrderResult,
  HaulingOrder,
  HaulingPaymentMethod,
} from '../../../../services/core/types/HaulingOrder';
import {
  HaulingPriceGroup,
  HaulingPriceGroupsResultLevel,
} from '../../../../services/core/types/HaulingPriceGroup';
import { getContacts } from '../../../../services/core/haulingContact';
import {
  calculateRates,
  calculateThresholdsRates,
  getHaulingPriceGroups,
} from '../../../../services/core/haulingPriceGroup';
import {
  createAutoMiscOrderBillableItems,
  createInitialOrderBillableItems,
  createOrderBillableItems,
} from './utils/createOrderBillableItems';
import { parseFacilitySrn } from '../../../../utils/srn';
import { weightTicketToHauling } from '../../../../services/core/weightTicketToHauling';
import { HaulingProject } from '../../../../services/core/types/HaulingProject';
import { HaulingOriginDistrict } from '../../../../services/core/types/HaulingOriginDistrict';
import { HaulingOriginDistrictHttpService } from '../../../../services/core/haulingOriginDistricts';
import { HaulingDestination } from '../../../../services/core/types/HaulingDestination';
import { HaulingDestinationHttpService } from '../../../../services/core/haulingDestination';
import { HaulingHttpCrudService } from '../../../../graphql/createHaulingCRUDResolver';
import { getHaulingBillableItems } from './BillableItemResolver';
import { HaulingBillableItem, HaulingBillableItemType } from '../../entities/BillableItem';
import {
  getCompanyGeneralSettings,
  getCompanyMailingSettings,
} from '../../../../services/core/companies';
import { EquipmentHttpService } from '../../../../services/core/equipments';
import { Equipment } from '../../../../services/core/types/Equipment';
import { coreErrorHandler } from './utils/coreErrorHandler';
import { updateElasticHaulingOrdersByQuery } from './utils/updateElasticOrderByQuery';
import { compilePermissions } from '../../../../utils/authChecker';
import { HaulingTaxDistrict } from '../../../../services/core/types/HaulingTaxDistrict';
import {
  postLackedOrdersAuditLogToHauling,
  PostOrderAuditLogToHaulingEvent,
} from '../../queues/postLackedOrdersAuditLogToHauling';
import { convertBillableItemTotalToBUUnits, convertItem } from './utils/convertWeights';
import {
  convertOrderBillableItemToInput,
  convertOrderBillableItemToThresholdInput,
  createOrderMaterialAndMiscellaneousDistribution,
  getMeasurementUnitFromMaterial,
  isFeeOrderBillableItem,
  isMaterialOrderBillableItem,
  isOrderBillableItemMaterialOrFee,
  updateOrderMaterialAndMiscellaneousDistribution,
} from './utils/orderHelpers';
import OrderIndexed from '../../entities/OrderIndexed';
import { getIndexName, getPrimaryId } from '../../decorators/ElasticSearch';
import { elasticSearch, UpdateByQueryResponse } from '../../../../services/elasticsearch';
import { BillableService } from '../../../../services/core/types/BillableService';
import NonCommercialTruck from '../../entities/NonCommercialTruck';

@InputType()
export class OrderInput {
  @Field(() => OrderType, { nullable: true })
  @IsEnum(OrderType)
  type?: OrderType;

  @Field({ nullable: true })
  @IsOptional()
  @Length(0, 200)
  WONumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(0, 200)
  PONumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(0, 250)
  note?: string;

  @Field({ nullable: true })
  @IsNumber()
  weightIn?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  customerId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  customerTruckId?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  licensePlate?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  customerJobSiteId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  projectId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  materialId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  originDistrictId?: number;

  @Field({ nullable: true })
  @IsDate()
  arrivedAt?: Date;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  weightOut?: number;

  @Field({ nullable: true })
  @IsDate()
  departureAt?: Date;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  destinationId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  priceGroupId?: number;

  @Field(() => PaymentMethodType, { nullable: true })
  @IsEnum(PaymentMethodType)
  paymentMethod?: PaymentMethodType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  creditCardId?: string;

  @Field(() => [OrderBillableItemInput], { nullable: true })
  @IsOptional()
  orderBillableItems?: OrderBillableItemInput[];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  bypassScale?: boolean;

  @Field({ nullable: true })
  @IsNumber()
  amount?: number;

  @Field({ nullable: true })
  checkNumber?: string;

  @Field({ nullable: true })
  isAch?: boolean;

  @Field(() => MeasurementUnit, { nullable: true })
  weightInUnit?: MeasurementUnit;

  @Field(() => MeasurementType, { nullable: true })
  weightInType?: MeasurementType;

  @Field({ nullable: true })
  weightInSource?: string;

  @Field({ nullable: true })
  weightInTimestamp?: Date;

  @Field({ nullable: true })
  weightInUser?: string;

  @Field(() => MeasurementUnit, { nullable: true })
  weightOutUnit?: MeasurementUnit;

  @Field(() => MeasurementType, { nullable: true })
  weightOutType?: MeasurementType;

  @Field({ nullable: true })
  weightOutSource?: string;

  @Field({ nullable: true })
  weightOutTimestamp?: Date;

  @Field({ nullable: true })
  weightOutUser?: string;

  @Field({ nullable: true })
  jobSiteId?: number;

  @Field({ nullable: true })
  isSelfService?: boolean;

  @Field({ nullable: true })
  containerId?: number;

  @Field({ nullable: true })
  useTare?: boolean;

  @Field({ nullable: true })
  truckTare?: number;

  @Field({ nullable: true })
  canTare?: number;

  @Field({ nullable: true })
  taxTotal?: number;

  @Field({ nullable: true })
  weightScaleUom?: string;
}

@InputType()
export class OrderUpdateInput extends OrderInput {
  @Field()
  id!: number;

  @Field(() => [OrderMaterialDistributionInput], { nullable: true })
  materialsDistributionInput?: OrderMaterialDistributionInput[];

  @Field(() => [OrderMiscellaneousMaterialDistributionInput], { nullable: true })
  miscellaneousMaterialsDistributionInput?: OrderMiscellaneousMaterialDistributionInput[];

  @Field(() => [OrderImage], { nullable: true })
  images?: OrderImage[];
}

@InputType()
export class OrderFilterInput {
  @Field(() => Int)
  customerId: number | null = null;

  @Field(() => Int, { defaultValue: null })
  jobSiteId?: number;

  @Field(() => Int, { defaultValue: null })
  customerJobSiteId?: number;

  @Field(() => [Int], { defaultValue: [] })
  projectIds?: number[];

  @Field(() => OrderStatus, { defaultValue: null })
  status: OrderStatus | null = null;

  @Field(() => Int, { defaultValue: null })
  customerTruckId: number | null = null;

  @Field(() => String, { defaultValue: null })
  WONumber: string | null = null;
}

const getRelation = async (
  entity: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ctx: QueryContext,
  relationId?: number | string,
  relations?: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  if (!relationId) {
    return null;
  }

  const ContextualizedEntity = getContextualizedEntity<typeof entity>(entity)(ctx);
  const relationRecord = await ContextualizedEntity.findOne(relationId, { relations });

  if (!relationRecord) {
    throw new Error(`${entity.name} was not found`);
  }

  return relationRecord;
};

const recreateOrder = async (ctx: QueryContext, order?: Order) => {
  if (!order || !order.truckOnWayId) {
    return;
  }

  const ContextualizedOrder = getContextualizedEntity(Order)(ctx);
  const haulingOrder = await orderService.getById(ctx, order.truckOnWayId);

  if (!haulingOrder) {
    throw new Error('Hauling order not found');
  }

  const newOrder = await getOrCreateOrderFromHaulingOrder({
    CtxOrder: ContextualizedOrder,
    haulingOrder,
    forceCreate: true,
  });

  newOrder.useContext(ctx);

  try {
    await ContextualizedOrder.getRepository().manager.transaction(async (entityManager) => {
      await entityManager.save(newOrder);

      const isDumpOrder = newOrder?.type === OrderType.DUMP;

      if (newOrder && isDumpOrder) {
        await createOrderMaterialAndMiscellaneousDistribution(ctx, newOrder);
        await entityManager.save(newOrder.materialsDistribution);
        await entityManager.save(newOrder.miscellaneousMaterialsDistribution);
      }

      return newOrder;
    });
  } catch (e) {
    ctx.log.error(e);

    throw e;
  }

  return newOrder;
};

const setOrderStatus = async (
  ctx: Context,
  id: number,
  status: OrderStatus,
  reason?: string,
): Promise<boolean> => {
  const ContextualizedOrder = getContextualizedEntity(Order)(ctx);
  const order = await ContextualizedOrder.findOne(id);

  if (!order) {
    throw new Error('Order not found');
  }

  order.status = status;
  order.reason = reason || null;
  order.useContext(ctx);
  await order.save();

  return true;
};

const createHaulingOrder = async (
  ctx: QueryContext,
  { orderId }: HaulingOrderInput,
  overrideCreditLimit?: boolean,
): Promise<CreateHaulingOrderResult> => {
  const ContextualizedOrder = getContextualizedEntity(Order)(ctx);
  const order = await ContextualizedOrder.findOneOrFail(orderId, {
    relations: ['billableItems'],
  });
  const permissions = [
    'orders:new-order:perform',
    'orders:override-credit-limit:perform',
    'orders:new-prepaid-on-hold-order:perform',
    'recycling:YardConsole:perform',
  ];

  if (order.paymentMethod === 'ON_ACCOUNT') {
    permissions.push('orders:new-on-account-on-hold-order:perform');
  }

  const requiredPermissions = ['orders:new-order:perform', 'recycling:YardConsole:perform'];

  const canUserCreateOrder = requiredPermissions.reduce(
    (result, current) => result || !!compilePermissions(ctx.userInfo, [current]),
    false,
  );

  if (!canUserCreateOrder) {
    throw new ApolloError("Access Denied! You don't have permission to create order", '403');
  }

  if (
    overrideCreditLimit &&
    !compilePermissions(ctx.userInfo, ['orders:override-credit-limit:perform'])
  ) {
    throw new ApolloError(
      "Access Denied! You don't have permission to override credit limit",
      '403',
    );
  }

  try {
    const auth = await HaulingHttpCrudService.getAuthorizationHeader(ctx, undefined, {
      tenantId: ctx.userInfo.tenantId,
    });

    const customer = await getCustomer(ctx, order.customerId, auth);

    if (
      customer.status === HaulingCustomerStatus.onHold &&
      !compilePermissions(ctx.userInfo, ['orders:new-prepaid-on-hold-order:perform'])
    ) {
      throw new ApolloError(
        "Access Denied! You don't have permission to create order for customer with status onHold",
        '403',
      );
    }

    const lineItems = order.billableItems
      .filter(
        (orderBillableItem) =>
          orderBillableItem.billableItemId && !isOrderBillableItemMaterialOrFee(orderBillableItem),
      )
      .map((orderBillableItem) => ({
        billableLineItemId: orderBillableItem.billableItemId,
        materialId: orderBillableItem.materialId,
        globalRatesLineItemsId: orderBillableItem.globalRatesLineItemsId,
        customRatesGroupLineItemsId: orderBillableItem.customRatesGroupLineItemsId || undefined,
        price: orderBillableItem.price,
        quantity: orderBillableItem.quantity,
        applySurcharges: false,
      })) as HaulingOrderInputType['lineItems'];

    let jobSiteId = order.jobSiteId;

    if (!jobSiteId && !order.originDistrictId) {
      const bu = await getBusinessUnit(ctx, auth);
      jobSiteId = bu.jobSiteId;
    }

    const orderInput: HaulingOrderNonServiceInput = {
      recycling: true,
      noBillableService: true,
      serviceAreaId: null,
      route: null,
      notifyDayBefore: null,
      jobSiteId,
      projectId: order.projectId || undefined,
      customRatesGroupId: order.priceGroupId || undefined,
      callOnWayPhoneNumber: null,
      callOnWayPhoneNumberId: null,
      textOnWayPhoneNumber: null,
      textOnWayPhoneNumberId: null,
      signatureRequired: false,
      thirdPartyHaulerId: null,
      alleyPlacement: false,
      cabOver: false,
      applySurcharges: false,
      poRequired: customer.poRequired ?? false,
      permitRequired: false,
      popupNote: null,
      serviceDate: new Date(),
      grandTotal: order.grandTotal,
      oneTimePurchaseOrderNumber: order.PONumber,
      lineItems: lineItems?.length ? lineItems : undefined,
      billableServiceQuantity: 1,
    };

    const payment = {
      paymentMethod: orderPaymentMethodHaulingMap[order.paymentMethod as PaymentMethodType],
      amount: order.grandTotal,
      checkNumber: order.paymentMethod === PaymentMethodType.CHECK ? order.checkNumber : undefined,
      isAch: order.paymentMethod === PaymentMethodType.CHECK ? order.isAch : undefined,
      creditCardId:
        order.paymentMethod === PaymentMethodType.CREDIT_CARD ? order.creditCardId : undefined,
      overrideCreditLimit,
    };

    if (order.type === OrderType.NON_SERVICE) {
      const data = {
        customerId: order.customerId,
        grandTotal: order.grandTotal,
        commercialTaxesUsed: true,
        orders: [orderInput],
        payments: [payment],
      };

      return await orderService.create(ctx, data, '', permissions);
    }

    const contacts = await getContacts(ctx, { customerId: order.customerId }, auth);

    const materialBillableItem = order.billableItems.find(isMaterialOrderBillableItem);
    const feeBillableItem = order.billableItems.find(isFeeOrderBillableItem);

    if (!feeBillableItem) {
      throw new ApolloError('Service fee order billable item not found');
    }

    const buSettings = await getCompanyGeneralSettings(ctx, auth);
    const billableService = await httpBillableService.getByType(ctx, order.type, auth);
    let material: HaulingMaterial;
    let useUnit = buSettings?.unit;

    if (order.materialId) {
      material = await getHaulingMaterial(ctx, order.materialId);
      useUnit = material?.units ? getMeasurementUnitFromMaterial(material?.units) : useUnit;
    }

    const thresholds = materialBillableItem
      ? [convertOrderBillableItemToThresholdInput(materialBillableItem, useUnit)]
      : undefined;

    Object.assign(orderInput, {
      noBillableService: false,
      equipmentItemId: billableService.equipmentItemId,
      billableServiceId: billableService.id,
      materialId: order.materialId,
      billableServiceQuantity: 1,
      billableServiceApplySurcharges: false,
      globalRatesServicesId: feeBillableItem.globalRatesServiceId || 0,
      billableServicePrice: (feeBillableItem.price ?? 0) * (feeBillableItem.quantity ?? 0),
      customRatesGroupServicesId: feeBillableItem.customRatesGroupServicesId || undefined,
      jobSiteContactId: contacts[0].id,
      bestTimeToComeFrom: '00:00',
      bestTimeToComeTo: '23:59',
      orderContactId: contacts[0].id,
      thresholds,
      originDistrictId: order.originDistrictId,
    });

    const data = {
      customerId: order.customerId,
      grandTotal: order.grandTotal,
      commercialTaxesUsed: true,
      orders: [orderInput],
      payments: [payment],
    };

    return await orderService.create(ctx, data, '', permissions);
  } catch (e) {
    coreErrorHandler(ctx, e);
  }
};

export const editHaulingOrder = async (
  ctx: QueryContext,
  orderId: number,
): Promise<HaulingOrder> => {
  const ContextualizedOrder = getContextualizedEntity(Order)(ctx);
  const order = await ContextualizedOrder.findOneOrFail(orderId, { relations: ['billableItems'] });

  if (!order.haulingOrderId) {
    throw new Error('Hauling order id is not defined');
  }

  if (!order.billableItems) {
    throw new Error('Order billable items not found');
  }

  const auth = await HaulingHttpCrudService.getAuthorizationHeader(ctx, undefined, {
    tenantId: ctx.userInfo.tenantId,
  });
  const haulingOrder = await orderService.getById(ctx, order.haulingOrderId, auth, undefined, {
    edit: true,
  });

  if (!haulingOrder) {
    throw new Error('Hauling order not found');
  }

  const billableServiceItem = order.billableItems.find(isFeeOrderBillableItem);

  const haulingData = pick(haulingOrder, [
    'notifyDayBefore',
    'lineItems',
    'serviceDate',
    'applySurcharges',
    'bestTimeToComeFrom',
    'bestTimeToComeTo',
    'status',
  ]);

  const lineItemsById = keyBy(haulingOrder.lineItems || [], 'billableLineItem.originalId');

  const lineItems = order.billableItems
    .filter(
      (orderBillableItem) =>
        orderBillableItem.billableItemId && !isOrderBillableItemMaterialOrFee(orderBillableItem),
    )
    .map((orderBillableItem) => {
      let lineItem;

      if (orderBillableItem.billableItemId && lineItemsById[orderBillableItem.billableItemId]) {
        lineItem = lineItemsById[orderBillableItem.billableItemId];
      }

      return {
        applySurcharges: false,
        ...lineItem,
        billableLineItemId: orderBillableItem.billableItemId,
        materialId: orderBillableItem.materialId,
        globalRatesLineItemsId: orderBillableItem.globalRatesLineItemsId,
        customRatesGroupLineItemsId: orderBillableItem.customRatesGroupLineItemsId || undefined,
        price: orderBillableItem.price,
        quantity: orderBillableItem.quantity,
      };
    });

  let payments = null;
  const payment = haulingOrder.payments?.[0];

  if (order.paymentMethod && order.paymentMethod !== PaymentMethodType.ON_ACCOUNT && payment) {
    const paymentType = orderPaymentMethodHaulingMap[order.paymentMethod];

    payments = [
      {
        paymentId: payment.id,
        paymentType,
        status: payment.status,
        checkNumber: paymentType === HaulingPaymentMethod.check ? order.checkNumber : null,
        isAch: paymentType === HaulingPaymentMethod.check ? order.isAch : null,
        creditCardId: paymentType === HaulingPaymentMethod.creditCard ? order.creditCardId : null,
      },
    ];
  }

  let jobSiteId = order.jobSiteId;

  if (!jobSiteId && !order.originDistrictId) {
    const bu = await getBusinessUnit(ctx, auth);
    jobSiteId = bu.jobSiteId;
  }

  if (order.type === OrderType.NON_SERVICE) {
    const data = {
      id: haulingOrder.id,
      recycling: true,
      noBillableService: true,
      ...haulingData,
      jobSiteId,
      projectId: order.projectId || undefined,
      customRatesGroupId: order.priceGroupId || undefined,
      billableServiceId: null,
      grandTotal: order.grandTotal,
      paymentMethod: orderPaymentMethodHaulingMap[order.paymentMethod as PaymentMethodType],
      payments,
      lineItems: lineItems.length ? lineItems : undefined,
      billableServiceQuantity: 1,
      oneTimePurchaseOrderNumber: order.PONumber,
    } as UpdateHaulingOrderInput;

    if (!order.PONumber) {
      data.purchaseOrderId = null;
    }

    return await orderService.update(ctx, data, auth);
  }

  const [thresholdItem] = haulingOrder.thresholds ?? [];
  const materialBillableItem = order.billableItems.find(isMaterialOrderBillableItem);
  const feeBillableItem = order.billableItems.find(isFeeOrderBillableItem);

  if (!feeBillableItem) {
    throw new ApolloError('Service fee order billable item not found');
  }

  const billableService = await httpBillableService.getByType(ctx, order.type, auth);

  let thresholds: OrderThresholdUpdateInput[] | undefined;

  if (materialBillableItem?.thresholdId && thresholdItem) {
    const buSettings = await getCompanyGeneralSettings(ctx, auth);
    thresholds = [
      {
        ...convertOrderBillableItemToThresholdInput(materialBillableItem, buSettings?.unit),
        id: thresholdItem.id,
        thresholdId: materialBillableItem.thresholdId,
        threshold: {
          id: thresholdItem.threshold.id,
          originalId: thresholdItem.threshold.originalId,
        },
      },
    ];
  }

  const data = {
    id: haulingOrder.id,
    recycling: true,
    noBillableService: false,
    billableServiceApplySurcharges: false,
    jobSiteContactId: haulingOrder.jobSiteContact?.originalId,
    orderContactId: haulingOrder.orderContact?.originalId,
    serviceAreaId: haulingOrder.serviceArea?.originalId,
    ...haulingData,
    jobSiteId,
    projectId: order.projectId || undefined,
    customRatesGroupId: order.priceGroupId || undefined,
    billableServiceId: billableService.id,
    materialId: order.materialId,
    billableServiceQuantity: 1,
    globalRatesServicesId: feeBillableItem.globalRatesServiceId,
    billableServicePrice: (billableServiceItem?.price ?? 0) * (billableServiceItem?.quantity ?? 0),
    customRatesGroupServicesId: feeBillableItem.customRatesGroupServicesId || undefined,
    equipmentItemId: billableService.equipmentItemId,
    grandTotal: order.grandTotal,
    paymentMethod: orderPaymentMethodHaulingMap[order.paymentMethod as PaymentMethodType],
    payments,
    lineItems: lineItems.length ? lineItems : undefined,
    thresholds,
    originDistrictId: order.originDistrictId,
    oneTimePurchaseOrderNumber: order.PONumber,
  } as UpdateHaulingOrderInput;

  if (!order.PONumber) {
    data.purchaseOrderId = null;
  }

  return await orderService.update(ctx, data, auth);
};

@InputType({ isAbstract: true })
export abstract class OrderReasonInput {
  @Field({ nullable: true })
  reason?: string;
}

@InputType()
export class OrderCompletedRequestInput extends OrderReasonInput {
  @Field(() => Boolean, { nullable: true })
  overrideCreditLimit?: boolean;
}

@InputType()
export class OrderApprovedRequestInput extends OrderReasonInput {}

const BaseResolver = createCRUDResolver<Order>(
  {
    EntityInput: OrderInput,
    FilterInput: OrderFilterInput,
    EntityUpdateInput: OrderUpdateInput,
    idType: Int,
    permissionsPrefix: 'recycling',
    softDelete: true,
    withOrderByRelationFields: true,
    permissions: {
      createEntity: [
        'recycling:SelfService:create',
        'recycling:Order:create',
        'recycling:GradingInterface:create',
        'recycling:YardConsole:create',
      ],
      updateEntity: [
        'recycling:SelfService:update',
        'recycling:Order:update',
        'recycling:GradingInterface:update',
        'recycling:YardConsole:update',
      ],
      entity: [
        'recycling:SelfService:view',
        'recycling:Order:view',
        'recycling:GradingInterface:view',
        'recycling:YardConsole:view',
      ],
    },
    modifyListParamsWithFilters(filter: OrderFilterInput, params: FindManyOptions<Order>) {
      const {
        customerId,
        customerJobSiteId,
        projectIds,
        status,
        WONumber,
        customerTruckId,
      } = filter;
      const where = params.where as FindConditions<Order>;

      if (customerId) {
        where.customerId = customerId;
      }

      if (customerJobSiteId) {
        where.customerJobSiteId = customerJobSiteId;
      }

      if (projectIds?.length) {
        where.projectId = In(projectIds);
      }

      if (status) {
        where.status = status;
      }

      if (WONumber) {
        where.WONumber = WONumber;
      }

      if (customerTruckId) {
        where.customerTruck = {
          id: customerTruckId,
        };
      }
    },
    async onCreate(
      newOrder: Order,
      {
        customerId,
        customerTruckId,
        WONumber,
        customerJobSiteId,
        type,
        orderBillableItems,
        licensePlate,
      }: OrderInput,
      ctx: QueryContext,
      save,
    ) {
      const ContextualizedOrder = getContextualizedEntity(Order)(ctx);

      newOrder.owner = ctx.userInfo.id;

      if (customerId) {
        const customer = await getCustomer(ctx, newOrder.customerId);
        newOrder.saleRepresentativeId = customer.salesId;

        if (customer.walkup && licensePlate) {
          const CtxNonCommercialTruck = getContextualizedEntity(NonCommercialTruck)(ctx);
          const nonCommercialTrucks = await CtxNonCommercialTruck.find({
            where: {
              licensePlate,
              customerId,
            },
          });

          if (nonCommercialTrucks.length === 0) {
            newOrder.nonCommercialTruck = await CtxNonCommercialTruck.save(
              CtxNonCommercialTruck.create({ licensePlate, customerId }),
            );
          } else {
            newOrder.nonCommercialTruck = nonCommercialTrucks[0];
          }
        }
      }

      if (type === OrderType.NON_SERVICE) {
        const CtxOrderBillableItem = getContextualizedEntity(OrderBillableItem)(ctx);

        const buSettings = await getCompanyGeneralSettings(ctx);

        newOrder.beforeTaxesTotal = 0;

        if (orderBillableItems) {
          newOrder.billableItems = orderBillableItems.map(({ materialId, uuid, ...rest }) => {
            const orderBillableItem = CtxOrderBillableItem.create({
              uuid,
            });

            CtxOrderBillableItem.merge(orderBillableItem, {
              ...rest,
              materialId: materialId || undefined,
            });

            return orderBillableItem;
          });
          newOrder.beforeTaxesTotal = round(
            sum(
              orderBillableItems.map((item) =>
                convertBillableItemTotalToBUUnits(item, buSettings?.unit),
              ),
            ),
            2,
          );
          newOrder.initialOrderTotal = newOrder.beforeTaxesTotal;
        }

        if (!newOrder.taxTotal) {
          newOrder.taxTotal = 0;
        }

        newOrder.grandTotal = round(newOrder.beforeTaxesTotal + newOrder.taxTotal, 2);

        newOrder.useContext(ctx);
        await save();

        return;
      }

      if (WONumber) {
        const duplicatedWONumber = await ContextualizedOrder.findOne({
          where: { WONumber, customerId },
        });

        if (duplicatedWONumber) {
          throw new ApolloError('Duplicated WONumber!');
        }
      }

      newOrder.customerTruck = await getRelation(CustomerTruck, ctx, customerTruckId);

      newOrder.taxTotal = 0;
      newOrder.beforeTaxesTotal = 0;
      newOrder.weightInUser = ctx.userInfo.id;

      if (customerId) {
        const priceGroupsResult = await getHaulingPriceGroups(ctx, {
          customerId,
          customerJobSiteId: customerJobSiteId || null,
        });

        if (priceGroupsResult.selectedId) {
          newOrder.priceGroupId = priceGroupsResult.selectedId;
        } else if (
          priceGroupsResult.level === HaulingPriceGroupsResultLevel.global &&
          !priceGroupsResult.customRatesGroups
        ) {
          newOrder.priceGroupId = 0;
        }
      }

      await save({ skipSave: true });

      await ContextualizedOrder.getRepository().manager.transaction(async (entityManager) => {
        await entityManager.save(newOrder);

        if (newOrder.type === OrderType.DUMP) {
          await createOrderMaterialAndMiscellaneousDistribution(ctx, newOrder);
          await entityManager.save(newOrder.materialsDistribution);
          await entityManager.save(newOrder.miscellaneousMaterialsDistribution);
        }
      });
    },
    async onUpdate(
      order: Order,
      {
        customerId,
        customerJobSiteId,
        customerTruckId,
        orderBillableItems,
        materialsDistributionInput,
        miscellaneousMaterialsDistributionInput,
        WONumber,
      }: OrderUpdateInput,
      ctx,
      save,
      prevData,
    ) {
      if (!ctx.userInfo.resource) {
        throw new Error('Failed to get resource from context');
      }

      const ContextualizedOrder = getContextualizedEntity(Order)(ctx);
      const CtxOrderBillableItem = getContextualizedEntity(OrderBillableItem)(ctx);
      let isWONumberUpdated = false;

      order.customerTruck = await getRelation(CustomerTruck, ctx, customerTruckId);
      order.billableItems = await CtxOrderBillableItem.find({
        where: {
          order,
        },
      });

      await updateOrderMaterialAndMiscellaneousDistribution(
        ctx,
        order,
        materialsDistributionInput || [],
        miscellaneousMaterialsDistributionInput || [],
      );

      if (orderBillableItems) {
        const billableItemsByUuid = keyBy(order.billableItems, 'uuid');
        const material = order.materialId ? await getHaulingMaterial(ctx, order.materialId) : null;
        order.billableItems = orderBillableItems.map(({ materialId, uuid, ...rest }) => {
          const orderBillableItem =
            billableItemsByUuid[uuid] ||
            CtxOrderBillableItem.create({
              uuid: uuidV4(),
            });

          const quantityConverted =
            materialId && material?.units
              ? convertItem(rest.quantity, getMeasurementUnitFromMaterial(material.units))
              : null;

          CtxOrderBillableItem.merge(orderBillableItem, {
            ...rest,
            materialId: materialId || undefined,
          });

          orderBillableItem.quantityConverted = quantityConverted || undefined;

          return orderBillableItem;
        });
      }

      const buSettings = await getCompanyGeneralSettings(ctx);

      let material: HaulingMaterial;

      if (order.materialId) {
        material = await getHaulingMaterial(ctx, order.materialId);
      }

      order.beforeTaxesTotal = round(
        sum(
          order.billableItems.map((item) => {
            let useUnit = buSettings?.unit;

            if (item.materialId) {
              useUnit = material?.units ? getMeasurementUnitFromMaterial(material?.units) : useUnit;
            }

            return convertBillableItemTotalToBUUnits(item, useUnit);
          }),
        ),
        2,
      );

      order.grandTotal = round(order.beforeTaxesTotal + order.taxTotal, 2);

      order.useContext(ctx);

      if (customerId && isNil(order.priceGroupId)) {
        const priceGroupsResult = await getHaulingPriceGroups(ctx, {
          customerId,
          customerJobSiteId: customerJobSiteId || null,
        });

        if (priceGroupsResult.selectedId) {
          order.priceGroupId = priceGroupsResult.selectedId;
        } else if (
          priceGroupsResult.level === HaulingPriceGroupsResultLevel.global &&
          !priceGroupsResult.customRatesGroups
        ) {
          order.priceGroupId = 0;
        }
      }

      if (!order.owner) {
        order.owner = ctx.userInfo.id;
      }

      const isWOChanged = !!WONumber && WONumber !== prevData.WONumber;

      await save({ skipSave: isWOChanged });

      if (!isWOChanged || !customerId) {
        return;
      }

      const { tenantName: recyclingTenantName, businessUnitId } = parseFacilitySrn(
        ctx.userInfo.resource,
      );
      const customer = await getCustomer(ctx, customerId);
      let haulingTenantName = recyclingTenantName;

      if (customer?.haulerSrn) {
        haulingTenantName = parseFacilitySrn(customer.haulerSrn).tenantName;
      }
      const orderByWONumber: Order | undefined = await ContextualizedOrder.findOne({
        where: { WONumber },
      });

      if (!orderByWONumber) {
        const newOrder = await recreateOrder(ctx, order);
        order.truckOnWayId = null;

        try {
          await ContextualizedOrder.getRepository().manager.transaction(async (entityManager) => {
            await entityManager.save(order);
          });
        } catch (e) {
          ctx.log.error(e);

          throw e;
        }

        if (newOrder) {
          weightTicketToHauling({
            recyclingOrderId: newOrder.id,
            haulingOrderId: newOrder.truckOnWayId || null,
            recyclingTenantName,
            haulingTenantName,
            businessUnitId,
          });
        }

        return;
      }

      orderByWONumber.useContext(ctx);

      try {
        await ContextualizedOrder.getRepository().manager.transaction(async (entityManager) => {
          const isOnWayStatus = orderByWONumber.status === OrderStatus.ON_THE_WAY;

          if (!isOnWayStatus) {
            throw new Error('Failed to save new WO#');
          }

          // update data in current order
          order.truckOnWayId = orderByWONumber.truckOnWayId;
          order.PONumber = orderByWONumber.PONumber;

          // update data in ToW order
          orderByWONumber.WONumber = prevData.WONumber;
          orderByWONumber.PONumber = prevData.PONumber;
          orderByWONumber.truckOnWayId = prevData.truckOnWayId;

          await entityManager.save([order, orderByWONumber]);

          isWONumberUpdated = true;
        });
      } catch (e) {
        ctx.log.error(e);

        throw e;
      }

      if (isWONumberUpdated && orderByWONumber.customerId) {
        const { haulerSrn } = await getCustomer(ctx, orderByWONumber.customerId);
        const changedOrders: {
          id: number;
          haulingOrderId?: number | null;
          haulerSrn: string | null;
        }[] = [
          {
            id: order.id,
            haulingOrderId: order.truckOnWayId,
            haulerSrn: customer.haulerSrn,
          },
          ...(orderByWONumber
            ? [
                {
                  id: orderByWONumber.id,
                  haulingOrderId: orderByWONumber.truckOnWayId,
                  haulerSrn: haulerSrn,
                },
              ]
            : []),
        ];

        changedOrders.forEach((changedOrder) => {
          if (!changedOrder?.haulerSrn) {
            return;
          }

          let haulingTenantName = recyclingTenantName;

          if (changedOrder.haulerSrn) {
            haulingTenantName = parseFacilitySrn(changedOrder.haulerSrn).tenantName;
          }
          weightTicketToHauling({
            recyclingOrderId: changedOrder.id,
            haulingOrderId: changedOrder.haulingOrderId || null,
            recyclingTenantName,
            haulingTenantName,
            businessUnitId,
          });
        });
      }

      return;
    },
    async onDelete(criteria, ctx) {
      if (!ctx.userInfo.resource) {
        throw new Error('Failed to get resource from context');
      }

      const ContextualizedOrder = getContextualizedEntity(Order)(ctx);
      const currentOrder = await ContextualizedOrder.findOne(criteria);
      const isInYard = currentOrder?.status === OrderStatus.IN_YARD;

      if (!currentOrder || !isInYard || !currentOrder.truckOnWayId) {
        return;
      }

      const { tenantName: recyclingTenantName, businessUnitId } = parseFacilitySrn(
        ctx.userInfo.resource,
      );
      let haulingTenantName = recyclingTenantName;
      const customer = await getCustomer(ctx, currentOrder.customerId);

      if (customer?.haulerSrn) {
        haulingTenantName = parseFacilitySrn(customer.haulerSrn).tenantName;
      }

      const order = await recreateOrder(ctx, currentOrder);

      if (!order) {
        return;
      }

      if (order) {
        weightTicketToHauling({
          recyclingOrderId: order.id,
          haulingOrderId: order.truckOnWayId || null,
          recyclingTenantName,
          haulingTenantName,
          businessUnitId,
        });
      }
    },
  },
  Order,
);

@InputType()
export class HaulingOrderInput {
  @Field()
  orderId!: number;
}

@InputType()
export class BillableServiceFilter {
  @Field(() => OrderType)
  type!: OrderType;
}

const orderPaymentMethodHaulingMap = {
  [PaymentMethodType.ON_ACCOUNT]: HaulingPaymentMethod.onAccount,
  [PaymentMethodType.CASH]: HaulingPaymentMethod.cash,
  [PaymentMethodType.CHECK]: HaulingPaymentMethod.check,
  [PaymentMethodType.CREDIT_CARD]: HaulingPaymentMethod.creditCard,
};

const orderTypeMapping: Record<OrderType.DUMP | OrderType.LOAD, 'dump' | 'load'> = {
  [OrderType.DUMP]: 'dump',
  [OrderType.LOAD]: 'load',
};

@Resolver(() => Order)
export default class OrderResolver extends BaseResolver {
  @Authorized([
    'configuration:billable-items:view',
    'recycling:SelfService:view',
    'recycling:YardConsole:perform',
  ])
  @FieldResolver(() => BillableService, { nullable: true })
  async billableService(
    @Ctx() ctx: QueryContext,
    @Root() order: Order,
  ): Promise<BillableService | null> {
    try {
      return await httpBillableService.getByType(ctx, order.type);
    } catch {
      return null;
    }
  }

  @FieldResolver(() => User, { nullable: true })
  async weightTicketCreator(@Root() order: Order, @Ctx() ctx: QueryContext): Promise<User | null> {
    if (!order.weightTicketCreatorId) {
      return null;
    }

    try {
      const user = await getUser({ id: order.weightTicketCreatorId, reqId: ctx.reqId });

      if (!(user?.firstName && user?.lastName)) {
        return null;
      }

      return user;
    } catch (e) {
      const errMsg = 'Failed to fetch user';
      ctx.log.error(e, errMsg);

      return null;
    }
  }

  @FieldResolver(() => HaulingCustomer)
  async customer(@Root() order: Order, @Ctx() ctx: QueryContext): Promise<HaulingCustomer> {
    return getCustomer(ctx, order.customerId);
  }

  @FieldResolver(() => CustomerTruck, { nullable: true })
  async customerTruck(
    @Root() order: Order,
    @Ctx() ctx: QueryContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<CustomerTruck | null> {
    const CtxCustomerTruck = getContextualizedEntity(CustomerTruck)(ctx);

    return CtxCustomerTruck.findOneAndSelectForQuery(info, { id: order.customerTruckId });
  }

  @FieldResolver(() => NonCommercialTruck, { nullable: true })
  async nonCommercialTruck(
    @Root() order: Order,
    @Ctx() ctx: QueryContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<NonCommercialTruck | null> {
    const CtxNonCommercialTruck = getContextualizedEntity(NonCommercialTruck)(ctx);

    return CtxNonCommercialTruck.findOneAndSelectForQuery(info, { id: order.nonCommercialTruckId });
  }

  @FieldResolver(() => HaulingCustomerJobSite, { nullable: true })
  async customerJobSite(
    @Root() order: Order,
    @Ctx() ctx: QueryContext,
  ): Promise<HaulingCustomerJobSite | null> {
    if (!order.jobSiteId) {
      return null;
    }

    return getHaulingCustomerJobSitePair(ctx, {
      customerId: order.customerId,
      jobSiteId: order.jobSiteId,
    });
  }

  @FieldResolver(() => HaulingCustomerJobSite, { nullable: true })
  async jobSite(
    @Root() order: Order,
    @Ctx() ctx: QueryContext,
  ): Promise<HaulingCustomerJobSite | null> {
    if (!order.jobSiteId) {
      return null;
    }

    return await getHaulingCustomerJobSite(ctx, {
      customerId: order.customerId,
      jobSiteId: order.jobSiteId,
    });
  }

  @FieldResolver(() => Equipment, { nullable: true })
  async container(@Root() order: Order, @Ctx() ctx: QueryContext): Promise<Maybe<Equipment>> {
    if (order.container) {
      return order.container;
    }

    if (!order.containerId) {
      return null;
    }

    return await new EquipmentHttpService().getById(ctx, order.containerId);
  }

  @FieldResolver(() => HaulingProject, { nullable: true })
  async project(@Root() order: Order, @Ctx() ctx: QueryContext): Promise<Maybe<HaulingProject>> {
    if (!order.projectId) {
      return null;
    }

    return await getHaulingProject(ctx, order.projectId);
  }

  @FieldResolver(() => HaulingDestination, { nullable: true })
  async destination(
    @Root() order: Order,
    @Ctx() ctx: QueryContext,
  ): Promise<Maybe<HaulingDestination>> {
    if (!order.destinationId) {
      return null;
    }

    return new HaulingDestinationHttpService().getById(ctx, order.destinationId);
  }

  @FieldResolver(() => HaulingMaterial, { nullable: true })
  async material(@Root() order: Order, @Ctx() ctx: QueryContext): Promise<HaulingMaterial | null> {
    if (!order.materialId) {
      return null;
    }

    return await getHaulingMaterial(ctx, order.materialId);
  }

  @FieldResolver(() => HaulingOriginDistrict, { nullable: true })
  async originDistrict(
    @Root() order: Order,
    @Ctx() ctx: QueryContext,
  ): Promise<Maybe<HaulingOriginDistrict>> {
    if (!order.originDistrictId) {
      return null;
    }

    return new HaulingOriginDistrictHttpService().getById(ctx, order.originDistrictId);
  }

  @FieldResolver(() => [OrderBillableItem])
  async billableItems(
    @Root() order: Order,
    @Ctx() ctx: QueryContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<OrderBillableItem[]> {
    const CtxOrderBillableItem = getContextualizedEntity(OrderBillableItem)(ctx);

    const items = await CtxOrderBillableItem.findAndSelectForQuery(info, { orderId: order.id });
    const material = order.materialId ? await getHaulingMaterial(ctx, order.materialId) : null;

    items.map((item, index) => {
      let quantityConverted;
      const doConvertQuantity =
        material && material?.id === item.materialId && isMaterialOrderBillableItem(item);

      if (doConvertQuantity && material?.units) {
        const quantity = parseFloat(item.quantity.toString());
        quantityConverted = convertItem(quantity, getMeasurementUnitFromMaterial(material.units));
      }

      items[index].quantityConverted = quantityConverted;
    });

    return sortBy(items, (item) => item.type !== OrderBillableItemType.MATERIAL);
  }

  @FieldResolver(() => [OrderMaterialDistribution])
  async materialsDistribution(
    @Root() order: Order,
    @Ctx() ctx: QueryContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<OrderMaterialDistribution[]> {
    const CtxOrderMaterialDistribution = getContextualizedEntity(OrderMaterialDistribution)(ctx);
    const materialDistributions = await CtxOrderMaterialDistribution.findAndSelectForQuery(info, {
      orderId: order.id,
    });
    const materialDistributionByMaterialId = keyBy(materialDistributions, 'materialId');
    const materials = await materialService.get(ctx, { activeOnly: true });

    return materials.data
      .filter((material) => material.yard)
      .map((material) => {
        let materialDistribution = materialDistributionByMaterialId[material.id];

        if (!materialDistribution) {
          materialDistribution = CtxOrderMaterialDistribution.merge(
            new CtxOrderMaterialDistribution(),
            {
              uuid: uuidV4(),
              value: 0,
              materialId: material.id,
            },
          );
        }

        materialDistribution.material = material;

        return materialDistribution;
      });
  }

  @FieldResolver(() => [OrderMiscellaneousMaterialDistribution])
  async miscellaneousMaterialsDistribution(
    @Root() order: Order,
    @Ctx() ctx: QueryContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<OrderMiscellaneousMaterialDistribution[]> {
    const CtxOrderMiscellaneousMaterialDistribution = getContextualizedEntity(
      OrderMiscellaneousMaterialDistribution,
    )(ctx);
    const miscMaterialDistributions = await CtxOrderMiscellaneousMaterialDistribution.findAndSelectForQuery(
      info,
      {
        orderId: order.id,
      },
    );

    const miscMaterialDistributionByMaterialId = keyBy(miscMaterialDistributions, 'materialId');
    const materials = await materialService.get(ctx, { activeOnly: true });

    return materials.data
      .filter((material) => material.misc)
      .map((material) => {
        let materialDistribution = miscMaterialDistributionByMaterialId[material.id];

        if (!materialDistribution) {
          materialDistribution = CtxOrderMiscellaneousMaterialDistribution.merge(
            new CtxOrderMiscellaneousMaterialDistribution(),
            {
              uuid: uuidV4(),
              quantity: 0,
              materialId: material.id,
            },
          );
        }

        materialDistribution.material = material;

        return materialDistribution;
      });
  }

  @FieldResolver(() => HaulingPriceGroup, { nullable: true })
  async priceGroup(
    @Root() order: Order,
    @Ctx() ctx: QueryContext,
  ): Promise<Maybe<HaulingPriceGroup>> {
    const globalPriceGroup = {
      description: 'Global Price Group',
      id: 0,
    };

    if (!order.priceGroupId) {
      return globalPriceGroup;
    }

    const filter = {
      customerId: order.customerId,
      customerJobSiteId: order?.customerJobSiteId || null,
    };

    const res = await getHaulingPriceGroups(ctx, filter);

    const priceGroup =
      res.customRatesGroups?.find((priceGroup) => priceGroup.id === order.priceGroupId) ||
      globalPriceGroup;

    return priceGroup;
  }

  @FieldResolver(() => String, { nullable: true })
  async weightTicketUrl(@Root() order: Order): Promise<string | null> {
    /*
    todo: there is no need to presign files because they save with public access, uncomment when files will be store with private access
    if (!order.weightTicketPrivateUrl) {
      return null;
    }

    const cacheKey = `${PRESIGNED_URL_CACHE_KEY_PREFIX}${order.weightTicketPrivateUrl}`;
    const keyTtl = await redis.ttl(cacheKey);

    if (keyTtl < WEIGHT_TICKET_PRESIGNED_URL_REGENERATE_THRESHOLD) {
      const presignedUrl = await filesUploadService.getPresignedUrl(order.weightTicketPrivateUrl, {
        Expires: WEIGHT_TICKET_PRESIGNED_URL_EXPIRATION,
      });

      await redis.set(cacheKey, presignedUrl, 'ex', WEIGHT_TICKET_PRESIGNED_URL_EXPIRATION);
    }

    return await redis.get(cacheKey);

     */
    return order.weightTicketPrivateUrl || null;
  }

  @FieldResolver(() => String, { nullable: true })
  async originalWeightIn(@Root() order: Order): Promise<Order['weightIn'] | null> {
    return order.weightIn || 0;
  }

  @FieldResolver(() => String, { nullable: true })
  async originalWeightOut(@Root() order: Order): Promise<Order['weightOut'] | null> {
    return order.weightOut || 0;
  }

  @FieldResolver(() => Boolean)
  async hasWeightTicket(@Root() order: Order): Promise<boolean> {
    return !!order.weightTicketPrivateUrl;
  }

  @Authorized(['recycling:Order:view', 'recycling:YardConsole:perform'])
  @Query(() => Float, { nullable: true })
  async minimalWeight(
    @Ctx()
    ctx: QueryContext,
    @Arg('priceGroupId', () => Int) priceGroupId: number,
    @Arg('materialId', () => Int)
    materialId: number,
    @Arg('type', () => OrderType)
    type: OrderType,
  ): Promise<number | null> {
    if (type === OrderType.NON_SERVICE) {
      throw new ApolloError('Non service type is invalid');
    }
    try {
      const [thresholdRate] = await calculateThresholdsRates(ctx, {
        customRatesGroupId: priceGroupId || null,
        materialId,
        netWeight: 0,
        action: orderTypeMapping[type],
      });

      return thresholdRate.quantity;
    } catch (e) {
      coreErrorHandler(ctx, e);
    }
  }

  @FieldResolver(() => Float, { nullable: true, name: 'minimalWeight' })
  async minimalWeightFieldResolver(
    @Ctx()
    ctx: QueryContext,
    @Root() order: Order,
  ): Promise<number | null> {
    if (!order.materialId || order.type === OrderType.NON_SERVICE) {
      return null;
    }

    try {
      return await this.minimalWeight(ctx, order.priceGroupId ?? 0, order.materialId, order.type);
    } catch {
      return null;
    }
  }

  @Authorized(['recycling:Order:view', 'recycling:YardConsole:perform'])
  @Mutation(() => [OrderBillableItem], { nullable: true })
  async fillOrderBillableItemsWithPrices(
    @Ctx()
    ctx: QueryContext,
    @Arg('orderBillableItems', () => [OrderBillableItemInput])
    orderBillableItemsInput: OrderBillableItemInput[],
    @Arg('priceGroupId', () => Int) priceGroupId: number,
    @Arg('materialId', () => Int, { nullable: true })
    materialId: number | null,
    @Arg('type', () => OrderType)
    type: OrderType,
    haulingBillableItems?: HaulingBillableItem[],
  ): Promise<OrderBillableItem[]> {
    const CtxOrderBillableItem = getContextualizedEntity(OrderBillableItem)(ctx);

    try {
      const billableItems =
        haulingBillableItems ||
        (await getHaulingBillableItems(ctx, {
          active: true,
          types: [HaulingBillableItemType.LINE, HaulingBillableItemType.MISCELLANIES],
        }));
      const billableItemsById = keyBy(billableItems, 'id');
      const isGlobalRates = priceGroupId === 0;
      const billableLineItems = orderBillableItemsInput
        .filter(
          (billableItem) =>
            billableItem.billableItemId && !isOrderBillableItemMaterialOrFee(billableItem),
        )
        .map((billableItem) => ({
          lineItemId: billableItem.billableItemId,
          materialId:
            billableItem.billableItemId &&
            billableItemsById[billableItem.billableItemId]?.materialBasedPricing
              ? billableItem.materialId ?? null
              : null,
        })) as BillableLineItemInput[];

      let thresholdBillableItem: OrderBillableItemInput | undefined;
      let billableServiceInput: BillableServiceCalculateInput | undefined;

      if (type !== OrderType.NON_SERVICE) {
        if (!materialId) {
          throw new ApolloError('Material is required for threshold rate calculation');
        }
        thresholdBillableItem = orderBillableItemsInput.find(isMaterialOrderBillableItem);

        if (thresholdBillableItem) {
          const payload = {
            customRatesGroupId: priceGroupId || null,
            materialId,
            netWeight: thresholdBillableItem.quantity,
            action: orderTypeMapping[type],
          };

          const [thresholdRate] = await calculateThresholdsRates(ctx, payload);

          thresholdBillableItem.thresholdId = thresholdRate.thresholdId;
          thresholdBillableItem.price = thresholdRate.price;
          thresholdBillableItem.quantity = thresholdRate.quantity;
          thresholdBillableItem.customRatesGroupThresholdsId =
            thresholdRate.customRatesGroupThresholdsId;
          thresholdBillableItem.globalRatesThresholdsId = thresholdRate.globalRatesThresholdsId;
          thresholdBillableItem.applySurcharges = thresholdRate.applySurcharges;
          thresholdBillableItem.priceSource = `${
            thresholdRate.globalRatesThresholdsId ?? thresholdRate.customRatesGroupThresholdsId
          }`;
          thresholdBillableItem.priceSourceType = isGlobalRates
            ? OrderPriceSourceType.GLOBAL_RACK_RATES
            : OrderPriceSourceType.PRICE_GROUP;
        }

        const billableService = await httpBillableService.getByType(ctx, type);
        billableServiceInput = {
          billableServiceId: billableService.id,
          equipmentItemId: billableService.equipmentItemId,
          materialId: billableService.materialBasedPricing ? materialId : null,
        };
      }

      const rates = await calculateRates(ctx, {
        type: isGlobalRates
          ? HaulingPriceGroupsResultLevel.global
          : HaulingPriceGroupsResultLevel.custom,
        billableService: billableServiceInput,
        customRatesGroupId: isGlobalRates ? undefined : priceGroupId,
        billableLineItems: billableLineItems.length ? billableLineItems : undefined,
      });

      const feeBillableItem = orderBillableItemsInput.find(isFeeOrderBillableItem);

      if (feeBillableItem) {
        feeBillableItem.priceSourceType = isGlobalRates
          ? OrderPriceSourceType.GLOBAL_RACK_RATES
          : OrderPriceSourceType.PRICE_GROUP;
        feeBillableItem.globalRatesServiceId = rates.globalRates?.globalRatesService?.id;
        feeBillableItem.customRatesGroupServicesId = rates.customRates?.customRatesService?.id;
        feeBillableItem.price =
          rates.customRates?.customRatesService?.price ??
          rates.globalRates?.globalRatesService?.price ??
          0;
      }

      const globalLineItemsPrices = groupBy(
        rates?.globalRates?.globalRatesLineItems || [],
        'lineItemId',
      );
      const customLineItemsPrices = groupBy(
        rates?.customRates?.customRatesLineItems || [],
        'lineItemId',
      );

      const material: HaulingMaterial | null = materialId
        ? await getHaulingMaterial(ctx, materialId)
        : null;

      return orderBillableItemsInput.map((orderBillableItem) => {
        if (isFeeOrderBillableItem(orderBillableItem)) {
          return CtxOrderBillableItem.merge(new CtxOrderBillableItem(), {
            ...orderBillableItem,
            ...feeBillableItem,
            materialId: orderBillableItem.materialId || undefined,
          });
        }

        let quantityConverted = orderBillableItem.quantityConverted;

        if (material && orderBillableItem.materialId === material.id && material.units) {
          quantityConverted = convertItem(
            orderBillableItem.quantity,
            getMeasurementUnitFromMaterial(material.units),
          );
        }

        if (isMaterialOrderBillableItem(orderBillableItem)) {
          const newOb = CtxOrderBillableItem.merge(new CtxOrderBillableItem(), {
            ...orderBillableItem,
            ...thresholdBillableItem,
            materialId: orderBillableItem.materialId || undefined,
            quantityConverted,
          });

          newOb.quantityConverted = quantityConverted;

          return newOb;
        }

        const billableItemId = orderBillableItem.billableItemId as number;
        const materialId = orderBillableItem.materialId;

        let globalRate, customRate;

        if (materialId) {
          const globalRatesByMaterial = keyBy(globalLineItemsPrices[billableItemId], 'materialId');
          const customRatesByMaterial = keyBy(customLineItemsPrices[billableItemId], 'materialId');
          globalRate = globalRatesByMaterial[materialId];
          customRate = customRatesByMaterial[materialId];
        } else {
          globalRate = globalLineItemsPrices[billableItemId]?.find((rate) => !rate.materialId);
          customRate = customLineItemsPrices[billableItemId]?.find((rate) => !rate.materialId);
        }

        const obi = CtxOrderBillableItem.merge(new CtxOrderBillableItem(), {
          ...orderBillableItem,
          materialId: orderBillableItem.materialId || undefined,
          priceSourceType: isGlobalRates
            ? OrderPriceSourceType.GLOBAL_RACK_RATES
            : OrderPriceSourceType.PRICE_GROUP,
          price: customRate?.price ?? globalRate?.price ?? 0,
          globalRatesLineItemsId: globalRate?.id,
          customRatesGroupLineItemsId: customRate?.id,
          quantityConverted,
        });
        obi.billableItem = billableItemsById[billableItemId];
        obi.quantityConverted = quantityConverted;

        return obi;
      });
    } catch (e) {
      coreErrorHandler(ctx, e);
    }
  }

  @Authorized(['recycling:Order:view', 'recycling:YardConsole:perform'])
  @Mutation(() => [OrderBillableItem], { nullable: true })
  async createOrderBillableItems(
    @Ctx()
    ctx: QueryContext,
    @Arg('billableItemsIds', () => [Int])
    billableItemsIds: number[],
    @Arg('priceGroupId', () => Int)
    priceGroupId: number,
    @Arg('materialId', () => Int, { nullable: true })
    materialId: number | null,
    @Arg('type', () => OrderType)
    type: OrderType,
  ): Promise<OrderBillableItem[]> {
    const billableItems = await getHaulingBillableItems(ctx, {
      active: true,
      types: [HaulingBillableItemType.LINE, HaulingBillableItemType.MISCELLANIES],
    });
    const orderBillableItems = createOrderBillableItems(
      billableItems.filter(({ id }) => billableItemsIds.includes(id)),
      materialId || null,
    );

    return this.fillOrderBillableItemsWithPrices(
      ctx,
      orderBillableItems,
      priceGroupId,
      materialId,
      type,
      billableItems,
    );
  }

  @Authorized(['recycling:Order:view', 'recycling:YardConsole:perform'])
  @Mutation(() => [OrderBillableItem], { nullable: true })
  async createAutoOrderBillableItems(
    @Ctx()
    ctx: QueryContext,
    @Arg('billableItemsIds', () => [Int])
    billableItemsIds: number[],
    @Arg('priceGroupId', () => Int)
    priceGroupId: number,
    @Arg('materialId', () => Int, { nullable: true })
    materialId: number | null,
    @Arg('type', () => OrderType)
    type: OrderType,
    @Arg('distributionMaterials', () => [Int])
    distributionMaterials: number[],
  ): Promise<OrderBillableItem[]> {
    const billableItems = await getHaulingBillableItems(ctx, {
      active: true,
      types: [HaulingBillableItemType.LINE, HaulingBillableItemType.MISCELLANIES],
    });
    const orderBillableItems = distributionMaterials.flatMap((distributionMaterialId) =>
      createOrderBillableItems(
        billableItems.filter(({ id }) => billableItemsIds.includes(id)),
        null,
      ).map((orderBillableItem) => ({
        ...orderBillableItem,
        materialId: distributionMaterialId,
        auto: true,
      })),
    );

    return this.fillOrderBillableItemsWithPrices(
      ctx,
      orderBillableItems,
      priceGroupId,
      materialId,
      type,
      billableItems,
    );
  }

  @Authorized(['recycling:Order:approve', 'recycling:YardConsole:perform'])
  @Mutation(() => Boolean)
  async approveOrders(
    @Ctx() ctx: QueryContext,
    @Arg('ids', () => [Int], { nullable: true }) ids: number[] | undefined,
  ): Promise<boolean> {
    try {
      const ContextualizedOrder = getContextualizedEntity(Order)(ctx);
      let result: UpdateResult;

      const orders = ids
        ? await ContextualizedOrder.findByIds(ids)
        : await ContextualizedOrder.find({ status: OrderStatus.COMPLETED });
      const haulingOrderIds = orders
        .filter((o) => o.haulingOrderId)
        .map((o) => o.haulingOrderId) as number[];

      await orderService.approveOrders(ctx, haulingOrderIds);

      if (ids) {
        result = await ContextualizedOrder.createQueryBuilder()
          .update()
          .set({ status: OrderStatus.APPROVED })
          .whereInIds(ids)
          .execute();
      } else {
        result = await ContextualizedOrder.createQueryBuilder()
          .update()
          .where({ status: OrderStatus.COMPLETED })
          .set({ status: OrderStatus.APPROVED })
          .execute();
      }

      await updateElasticHaulingOrdersByQuery(ctx, OrderStatus.APPROVED, haulingOrderIds);

      return !!result;
    } catch (e) {
      coreErrorHandler(ctx, e);
    }
  }

  @Authorized(['recycling:Order:finalize', 'recycling:YardConsole:perform'])
  @Mutation(() => Boolean)
  async finalizeOrders(
    @Ctx() ctx: QueryContext,
    @Arg('ids', () => [Int], { nullable: true }) ids: number[] | undefined,
  ): Promise<boolean> {
    try {
      const ContextualizedOrder = getContextualizedEntity(Order)(ctx);
      let result: UpdateResult;

      const orders = ids
        ? await ContextualizedOrder.findByIds(ids)
        : await ContextualizedOrder.find({ status: OrderStatus.APPROVED });
      const haulingOrderIds = orders
        .filter((o) => o.haulingOrderId)
        .map((o) => o.haulingOrderId) as number[];

      await orderService.finalizeOrders(ctx, haulingOrderIds);

      if (ids) {
        result = await ContextualizedOrder.createQueryBuilder()
          .update()
          .set({ status: OrderStatus.FINALIZED })
          .whereInIds(ids)
          .execute();
      } else {
        result = await ContextualizedOrder.createQueryBuilder()
          .update()
          .where({ status: OrderStatus.APPROVED })
          .set({ status: OrderStatus.FINALIZED })
          .execute();
      }

      await updateElasticHaulingOrdersByQuery(ctx, OrderStatus.FINALIZED, haulingOrderIds);

      return !!result;
    } catch (e) {
      coreErrorHandler(ctx, e);
    }
  }

  @Mutation(() => Boolean)
  async bulkRemoveOrder(
    @Ctx() ctx: QueryContext,
    @Arg('ids', () => [Int]) ids: number[],
  ): Promise<boolean> {
    for (const id of ids) {
      await this.deleteEntity(id, ctx);
    }

    return true;
  }

  @Authorized([
    'recycling:Order:update',
    'recycling:GradingInterface:update',
    'recycling:YardConsole:perform',
  ])
  @Mutation(() => Boolean)
  async gradingOrder(
    @Ctx() ctx: QueryContext,
    @Arg('gradingPayload', () => GradingPayloadInput)
    {
      orderId,
      materialsDistribution,
      miscellaneousMaterialsDistribution,
      images,
    }: GradingPayloadInput,
  ): Promise<boolean> {
    const ContextualizedOrder = getContextualizedEntity(Order)(ctx);

    const order = await ContextualizedOrder.findOne(orderId, {
      relations: ['materialsDistribution', 'miscellaneousMaterialsDistribution', 'billableItems'],
    });

    if (!order) {
      throw new Error(`Order not found`);
    }

    await updateOrderMaterialAndMiscellaneousDistribution(
      ctx,
      order,
      materialsDistribution || [],
      miscellaneousMaterialsDistribution || [],
    );
    order.images = images;

    if (order.status === OrderStatus.PAYMENT) {
      if (isNil(order.priceGroupId)) {
        throw new Error('Price group is not defined');
      }

      if (!order.materialId) {
        throw new Error('Material is not defined');
      }

      const autoBillableItems = await createAutoMiscOrderBillableItems(
        ctx,
        order.miscellaneousMaterialsDistribution,
      );
      order.billableItems = order.billableItems
        .filter((obi) => !obi.auto)
        .concat(autoBillableItems);

      try {
        order.billableItems = await this.fillOrderBillableItemsWithPrices(
          ctx,
          order.billableItems.map((bi) => {
            return convertOrderBillableItemToInput(bi);
          }),
          order.priceGroupId,
          order.materialId,
          order.type,
        );
      } catch (e) {
        coreErrorHandler(ctx, e);
      }
    }

    order.useContext(ctx);
    await order.save();

    const indexed = new OrderIndexed(order);
    const { metadata } = ContextualizedOrder.getRepository();
    const index = getIndexName(ctx.userInfo.resource!, metadata.tableName);
    const id = getPrimaryId(metadata, order as any);

    const result = await elasticSearch.client.updateByQuery<UpdateByQueryResponse>({
      index: index,
      refresh: true,
      body: {
        script: {
          lang: 'painless',
          source: `ctx._source["graded"] = ${indexed.graded}`,
        },
        query: {
          term: {
            id: id,
          },
        },
      },
    });

    ctx.log.info(`Grading result ${JSON.stringify(result)}`);

    return true;
  }

  @Authorized(['recycling:Order:inyard', 'recycling:YardConsole:perform'])
  @Mutation(() => Boolean, { description: `Change order status to ${OrderStatus.IN_YARD}` })
  async makeOrderInYard(
    @Ctx() ctx: QueryContext,
    @Arg('id', () => Int) id: number,
  ): Promise<boolean> {
    return setOrderStatus(ctx, id, OrderStatus.IN_YARD);
  }

  @Authorized(['recycling:Order:weightout', 'recycling:YardConsole:perform'])
  @Mutation(() => Boolean, { description: `Change order status to ${OrderStatus.WEIGHT_OUT}` })
  async makeOrderWeightOut(
    @Ctx() ctx: QueryContext,
    @Arg('id', () => Int) id: number,
  ): Promise<boolean> {
    return setOrderStatus(ctx, id, OrderStatus.WEIGHT_OUT);
  }

  @Authorized(['recycling:Order:view', 'recycling:YardConsole:perform'])
  @Mutation(() => Boolean, { description: `Send pdf weight ticket via email` })
  async sendPdfWeightTicketViaEmail(
    @Ctx()
    ctx: QueryContext,
    @Arg('id', () => Int)
    id: number,
    @Arg('email', () => String)
    to: string,
  ): Promise<boolean> {
    const ContextualizedOrder = getContextualizedEntity(Order)(ctx);
    const order = await ContextualizedOrder.findOne(id);

    if (!order) {
      throw new Error(`Order not found`);
    }

    if (!order.weightTicketPrivateUrl) {
      throw new Error(`Order without weight ticket`);
    }

    try {
      const weightTicketFileBuffer = await filesUploadService.getObject(
        order.weightTicketPrivateUrl,
      );

      const attachments = [
        {
          type: 'application/pdf',
          content: weightTicketFileBuffer.toString('base64'),
          filename: `weightTicket.pdf`,
        },
      ];

      const mailingData = await getCompanyMailingSettings(ctx);

      await sendEmailWithAttachments({
        from: `${mailingData.weightTicketFrom}@${mailingData.domain}`,
        to: to,
        replyTo: `${mailingData.weightTicketReplyTo}@${mailingData.domain}`,
        subject: mailingData.weightTicketSubject,
        text: mailingData.weightTicketBody,
        copyTo: mailingData.weightTicketSendCopyTo,
        attachments,
      });
    } catch (error) {
      ctx.log.error(error, `Failed to send email with with attachment for orderId = ${order?.id}`);

      throw new Error('Failed to send email with with attachment');
    }

    return true;
  }

  @Authorized(['recycling:Order:load', 'recycling:YardConsole:perform'])
  @Mutation(() => Boolean, { description: `Change order status to ${OrderStatus.LOAD}` })
  async makeOrderLoaded(
    @Ctx() ctx: QueryContext,
    @Arg('id', () => Int) id: number,
  ): Promise<boolean> {
    return setOrderStatus(ctx, id, OrderStatus.LOAD);
  }

  @Authorized([
    'recycling:Order:payment',
    'recycling:SelfService:perform',
    'recycling:YardConsole:perform',
  ])
  @Mutation(() => Boolean, {
    description: `Change order status to ${OrderStatus.PAYMENT}`,
    nullable: true,
  })
  async makeOrderPayment(
    @Ctx() ctx: QueryContext,
    @Arg('id', () => Int) id: number,
  ): Promise<boolean> {
    const ContextualizedOrder = getContextualizedEntity(Order)(ctx);

    const order = await ContextualizedOrder.findOneOrFail(id, {
      relations: ['billableItems', 'miscellaneousMaterialsDistribution'],
    });

    if (!order.materialId) {
      throw new Error('Material is not defined');
    }

    if (isNil(order.priceGroupId)) {
      throw new Error('Price group is not defined');
    }

    if (order.type === OrderType.NON_SERVICE) {
      throw new Error('Non service order is not support yet');
    }

    try {
      const [thresholdBillableItem, feeBillableItem] = await createInitialOrderBillableItems(ctx, {
        order,
        orderId: order.id,
      });

      if (!order.billableItems.some(isFeeOrderBillableItem)) {
        order.billableItems.push(feeBillableItem);
      }

      if (!order.billableItems.some(isMaterialOrderBillableItem)) {
        order.billableItems.push(thresholdBillableItem);
      }

      if (order.type === OrderType.DUMP) {
        const autoBillableItems = await createAutoMiscOrderBillableItems(
          ctx,
          order.miscellaneousMaterialsDistribution,
        );
        order.billableItems = order.billableItems
          .filter((obi) => !obi.auto)
          .concat(autoBillableItems);
      }

      order.billableItems = await this.fillOrderBillableItemsWithPrices(
        ctx,
        order.billableItems.map((bi) => {
          return convertOrderBillableItemToInput(bi);
        }),
        order.priceGroupId,
        order.materialId,
        order.type,
      );
    } catch (e) {
      coreErrorHandler(ctx, e);
    }

    order.status = OrderStatus.PAYMENT;
    order.reason = 'Change order status to PAYMENT';
    order.useContext(ctx);
    order.weightOutUser = ctx.userInfo.id;

    await order.save();

    return true;
  }

  @Authorized([
    'recycling:Order:complete',
    'orders:new-order:perform',
    'orders:new-prepaid-on-hold-order:perform',
    'recycling:YardConsole:perform',
  ])
  @Mutation(() => Boolean, {
    description: `Change order status to ${OrderStatus.COMPLETED}`,
    nullable: true,
  })
  async makeOrderCompleted(
    @Ctx() ctx: QueryContext,
    @Arg('id', () => Int) id: number,
    @Arg('data', () => OrderCompletedRequestInput, { nullable: true })
    data?: OrderCompletedRequestInput,
  ): Promise<boolean> {
    const ContextualizedOrder = getContextualizedEntity(Order)(ctx);
    const order = await ContextualizedOrder.findOneOrFail(id);

    if (!order.haulingOrderId) {
      const haulingOrder = await createHaulingOrder(
        ctx,
        { orderId: id },
        data?.overrideCreditLimit,
      );
      order.haulingOrderId = haulingOrder.id;

      // grab all audit logs
      await postLackedOrdersAuditLogToHauling.add('post-lacked-orders-audit-log-to-hauling', {
        recyclingOrderId: id,
        haulingOrderId: haulingOrder.id,
        entityName: Order.name,
        resource: ctx.userInfo.resource ?? order._userInfo?.resource,
        userId: ctx.userInfo.id,
        requestId: ctx.reqId,
      } as PostOrderAuditLogToHaulingEvent);
    }

    if (order.status === OrderStatus.APPROVED) {
      try {
        await orderService.unApprove(ctx, order.haulingOrderId, data?.reason || null);
      } catch (e) {
        coreErrorHandler(ctx, e);
      }
    }

    order.useContext(ctx);
    order.status = OrderStatus.COMPLETED;
    order.reason = data?.reason || null;

    if (Number(order.initialOrderTotal) === 0) {
      order.initialOrderTotal = Number(order.beforeTaxesTotal);
    }

    await order.save();

    return true;
  }

  @Authorized([
    'recycling:Order:approve',
    'orders:approve:perform',
    'recycling:YardConsole:perform',
  ])
  @Mutation(() => Boolean, {
    description: `Change order status to ${OrderStatus.APPROVED}`,
    nullable: true,
  })
  async makeOrderApproved(
    @Ctx() ctx: QueryContext,
    @Arg('id', () => Int) id: number,
    @Arg('data', () => OrderApprovedRequestInput, { nullable: true })
    data?: OrderApprovedRequestInput,
  ): Promise<boolean> {
    const ContextualizedOrder = getContextualizedEntity(Order)(ctx);
    const order = await ContextualizedOrder.findOneOrFail(id);

    if (order.haulingOrderId) {
      try {
        if (order.status === OrderStatus.FINALIZED) {
          await orderService.unFinalize(ctx, order.haulingOrderId, data?.reason || null);
        } else {
          await orderService.approveOrders(ctx, [order.haulingOrderId]);
        }
      } catch (e) {
        coreErrorHandler(ctx, e);
      }
    }

    return setOrderStatus(ctx, id, OrderStatus.APPROVED, data?.reason);
  }

  @Authorized([
    'recycling:Order:finalize',
    'orders:finalize:perform',
    'recycling:YardConsole:perform',
  ])
  @Mutation(() => Boolean, {
    description: `Change order status to ${OrderStatus.FINALIZED}`,
    nullable: true,
  })
  async makeOrderFinalized(
    @Ctx() ctx: QueryContext,
    @Arg('id', () => Int) id: number,
  ): Promise<boolean> {
    const ContextualizedOrder = getContextualizedEntity(Order)(ctx);
    const order = await ContextualizedOrder.findOneOrFail(id);

    if (order.haulingOrderId) {
      try {
        await orderService.finalizeOrders(ctx, [order.haulingOrderId]);
      } catch (e) {
        coreErrorHandler(ctx, e);
      }
    }

    return setOrderStatus(ctx, id, OrderStatus.FINALIZED);
  }

  @Authorized(['recycling:Order:invoice', 'recycling:YardConsole:perform'])
  @Mutation(() => Boolean, { description: `Change order status to ${OrderStatus.INVOICED}` })
  async makeOrderInvoiced(
    @Ctx() ctx: QueryContext,
    @Arg('id', () => Int) id: number,
  ): Promise<boolean> {
    return setOrderStatus(ctx, id, OrderStatus.INVOICED);
  }

  @Authorized([
    'recycling:Order:complete',
    'orders:new-order:perform',
    'recycling:YardConsole:perform',
  ])
  @Mutation(() => Boolean, { description: `Complete walkup customer order`, nullable: true })
  async completeWalkUpCustomerOrder(
    @Ctx() ctx: QueryContext,
    @Arg('id', () => Int) id: number,
  ): Promise<boolean> {
    const ContextualizedOrder = getContextualizedEntity(Order)(ctx);
    const order = await ContextualizedOrder.findOneOrFail(id);

    if (!order.haulingOrderId) {
      const haulingOrder = await createHaulingOrder(ctx, { orderId: id });
      order.haulingOrderId = haulingOrder.id;

      // grab all audit logs
      await postLackedOrdersAuditLogToHauling.add('post-lacked-orders-audit-log-to-hauling', {
        recyclingOrderId: id,
        haulingOrderId: haulingOrder.id,
        entityName: Order.name,
        resource: ctx.userInfo.resource ?? order._userInfo?.resource,
        userId: ctx.userInfo.id,
        requestId: ctx.reqId,
      } as PostOrderAuditLogToHaulingEvent);
    }

    order.status = OrderStatus.FINALIZED;
    order.useContext(ctx);
    await order.save();

    return true;
  }

  @Authorized()
  @Query(() => [Order])
  async ordersByHaulingId(
    @Ctx() ctx: QueryContext,
    @Arg('ids', () => [Int]) ids: number[],
  ): Promise<Order[]> {
    const ContextualizedOrder = getContextualizedEntity(Order)(ctx);

    return ContextualizedOrder.find({
      haulingOrderId: In(ids),
    });
  }

  @FieldResolver(() => [HaulingTaxDistrict], { nullable: true })
  async taxDistricts(
    @Root() order: Order,
    @Ctx() ctx: QueryContext,
  ): Promise<HaulingTaxDistrict[] | null> {
    if (!order.haulingOrderId) {
      return null;
    }

    try {
      const haulingOrder = await orderService.getById(ctx, order.haulingOrderId);

      return haulingOrder?.taxDistricts ?? null;
    } catch (e) {
      coreErrorHandler(ctx, e);
    }
  }

  @Authorized()
  @Query(() => String, { nullable: true })
  async lastUsedCreditCard(
    @Ctx() ctx: QueryContext,
    @Arg('customerId', () => Int) customerId: number,
    @Arg('jobSiteId', () => Int, { nullable: true }) jobSiteId: number | null,
  ): Promise<string | null> {
    const ContextualizedOrder = getContextualizedEntity(Order)(ctx);
    const order = await ContextualizedOrder.findOne({
      where: { customerId, jobSiteId, creditCardId: Not(IsNull()) },
      order: { updatedAt: 'DESC' },
    });

    return order?.creditCardId || null;
  }
}
