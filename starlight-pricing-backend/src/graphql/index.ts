import { graphqlHTTP } from 'koa-graphql';
import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLSchema,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
} from 'graphql';
import { FindOptionsWhere } from 'typeorm';
import { PriceGroups } from '../database/entities/tenant/PriceGroups';
import { AppDataSource } from '../data-source';
import { Prices } from '../database/entities/tenant/Prices';
import { OrderRequests } from '../database/entities/tenant/OrderRequests';
import { PriceGroupsHistorical } from '../database/entities/tenant/PriceGroupsHistorical';
import { SubscriptionsPeriods } from '../database/entities/tenant/SubscriptionsPeriods';
import { RecurrentOrderTemplate } from '../database/entities/tenant/RecurrentOrderTemplates';
import { Orders } from '../database/entities/tenant/Orders';
import { RecurrentOrderTemplateHistorical } from '../database/entities/tenant/RecurrentOrderTemplatesHistorical';
import { RecurrentOrderTemplateLineItems } from '../database/entities/tenant/RecurrentOrderTemplateLineItems';
import { RecurrentOrderTemplateLineItemsHistorical } from '../database/entities/tenant/RecurrentOrderTemplateLineItemsHistorical';
import { ThresholdItems } from '../database/entities/tenant/ThresholdItems';
import { SurchargeItem } from '../database/entities/tenant/SurchargeItem';
import { LineItems } from '../database/entities/tenant/LineItems';
import { SubscriptionRecurringLineItemsSchedule } from '../database/entities/tenant/SubscriptionRecurringLineItemsSchedule';
import { SubscriptionServiceItemsSchedule } from '../database/entities/tenant/SubscriptionServiceItemsSchedule';
import { SubscriptionOrders } from '../database/entities/tenant/SubscriptionOrders';
import { SubscriptionOrdersLineItems } from '../database/entities/tenant/SubscriptionOrdersLineItems';
import { CustomRatesGroups } from '../database/entities/tenant/CustomRatesGroups';
import { CustomRatesGroupsHistorical } from '../database/entities/tenant/CustomRatesGroupsHistorical';
import { CustomRatesGroupServices } from '../database/entities/tenant/CustomRatesGroupServices';
import { IWherePrices } from '../Interfaces/Prices';
import { IWhereOrders } from '../Interfaces/Orders';
import { IWhereRecurrentOrderTemplateLineItemsHistorical } from '../Interfaces/RecurrentOrderTemplateLineItemsHistorical';
import { IWhereOrderRequests } from '../Interfaces/OrderRequests';
import { IWhereRecurrentOrderTemplate } from '../Interfaces/RecurrentOrderTemplate';
import { IWhereRecurrentOrderTemplateHistorical } from '../Interfaces/RecurrentOrderTemplateHistorical';
import { IWhereLineItems } from '../Interfaces/LineItems';
import { IWhereRecurrentOrderTemplateLineItems } from '../Interfaces/RecurrentOrderTemplateLineItems';
import { ICustomRatesGroupsResolver } from '../Interfaces/CustomRatesGroups';
import { IArgsPriceGroups, IWherePriceGroups } from '../Interfaces/PriceGroups';
import { IWhere } from '../Interfaces/GeneralsFilter';
import recurrentOrderTemplateHistoricalType from './recurrentOrderTemplateHistorical/type';
import recurrentOrderTemplateLineItemsType from './recurrentOrderTemplateLineItems/type';
import recurrentOrderTemplateLineItemsHistoricalType from './recurrentOrderTemplateLineItemsHistorical/type';
import thresholdItemsType from './thresholdItems/types';
import surchargeItemType from './surchargeItem/types';
import lineItemsType from './lineItems/types';
import subscriptionsRecurringType from './subscriptionRecurringLineItemsSchedule/type';
import subscriptionsServiceType from './subscriptionServiceItemsSchedule/type';
import subscriptionOrderType from './subscriptionOrder/type';
import subscriptionOrdersLineItemsType from './subscriptionOrdersLineItems/type';
import customRatesGroupsHistoricalType from './customRatesGroupsHistorical/types';
import customRatesGroupsType from './customRatesGroups/types';
import orderType from './orders/types';
import recurrentOrderTemplateType from './recurrentOrderTemplate/type';
import subscriptionsPeriodsType from './subscriptionsPeriods/type';
import priceGroupHistoricalType from './priceGroupHistorical/type';
import orderRequestType from './orderRequest/type';
import priceGroupType from './priceGroup/type';
import priceType from './prices/type';
import customRatesGroupServicesType from './customRatesGroupServices/types';
import { customRatesGroupsResolver, selectRatesGroupResolver } from './customRatesGroups/resolver';

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    priceGroups: {
      type: new GraphQLList(priceGroupType),
      description: 'List of price groups',
      resolve: () => AppDataSource.manager.find(PriceGroups),
    },
    prices: {
      type: new GraphQLList(priceType),
      description: 'List of price groups',
      resolve: () => AppDataSource.manager.find(Prices),
    },
    orderRequest: {
      type: new GraphQLList(orderRequestType),
      description: 'list of order request',
      resolve: () => AppDataSource.manager.find(OrderRequests),
    },
    priceGroupsHistorical: {
      type: new GraphQLList(priceGroupHistoricalType),
      description: 'List of price groups historical',
      resolve: () => AppDataSource.manager.find(PriceGroupsHistorical),
    },
    subscriptionsPeriods: {
      type: new GraphQLList(subscriptionsPeriodsType),
      description: 'List of price groups historical',
      resolve: () => AppDataSource.manager.find(SubscriptionsPeriods),
    },
    recurrentOrderTemplate: {
      type: new GraphQLList(recurrentOrderTemplateType),
      description: 'List of recurrent order template',
      resolve: () => AppDataSource.manager.find(RecurrentOrderTemplate),
    },
    orders: {
      type: new GraphQLList(orderType),
      description: 'list of orders',
      resolve: () => AppDataSource.manager.find(Orders),
    },
    recurrentOrderTemplateHistorical: {
      type: new GraphQLList(recurrentOrderTemplateHistoricalType),
      description: 'List of recurrent order template historical',
      resolve: () => AppDataSource.manager.find(RecurrentOrderTemplateHistorical),
    },
    recurrentOrderTemplateLineItems: {
      type: new GraphQLList(recurrentOrderTemplateLineItemsType),
      description: 'List of recurrent order template line items',
      resolve: () => AppDataSource.manager.find(RecurrentOrderTemplateLineItems),
    },
    recurrentOrderTemplateLineItemsHistorical: {
      type: new GraphQLList(recurrentOrderTemplateLineItemsHistoricalType),
      description: 'List of recurrent order template line items',
      resolve: () => AppDataSource.manager.find(RecurrentOrderTemplateLineItemsHistorical),
    },
    thresholdItems: {
      type: new GraphQLList(thresholdItemsType),
      description: 'list of thresholdItems',
      resolve: () => AppDataSource.manager.find(ThresholdItems),
    },
    surchargeItem: {
      type: new GraphQLList(surchargeItemType),
      description: 'list of surchargeItem',
      resolve: () => AppDataSource.manager.find(SurchargeItem),
    },
    lineItems: {
      type: new GraphQLList(lineItemsType),
      description: 'list of lineItems',
      resolve: () => AppDataSource.manager.find(LineItems),
    },
    subscriptionsRecurringLineItemsSchedule: {
      type: new GraphQLList(subscriptionsRecurringType),
      description: 'list of subscription recurring line items schedule',
      resolve: () => AppDataSource.manager.find(SubscriptionRecurringLineItemsSchedule),
    },
    subscriptionsServiceItemsSchedule: {
      type: new GraphQLList(subscriptionsServiceType),
      description: 'list of subscription service items schedule',
      resolve: () => AppDataSource.manager.find(SubscriptionServiceItemsSchedule),
    },
    subscriptionOrder: {
      type: new GraphQLList(subscriptionOrderType),
      description: 'list of subscription orders ',
      resolve: () => AppDataSource.manager.find(SubscriptionOrders),
    },
    subscriptionOrdersLineItems: {
      type: new GraphQLList(subscriptionOrdersLineItemsType),
      description: 'list of subscription orders line items ',
      resolve: () => AppDataSource.manager.find(SubscriptionOrdersLineItems),
    },
    priceGroupsBy: {
      type: new GraphQLList(priceGroupType),
      args: {
        id: { type: GraphQLInt },
        businessUnitId: { type: GraphQLInt },
        businessLineId: { type: GraphQLInt },
        serviceAreaIds: { type: new GraphQLList(GraphQLInt) },
        customerGroupId: { type: GraphQLInt },
        customerId: { type: GraphQLInt },
        customerJobSiteId: { type: GraphQLInt },
        active: { type: GraphQLBoolean },
      },
      description: 'List of price groups',
      resolve: (_parent, args: IArgsPriceGroups) => {
        const where: FindOptionsWhere<IWherePriceGroups> | FindOptionsWhere<IWherePriceGroups>[] =
          {};
        if (args.id) {
          where.id = args.id;
        }
        if (args.businessLineId) {
          where.businessLineId = args.businessLineId;
        }
        if (args.businessUnitId) {
          where.businessUnitId = args.businessUnitId;
        }
        if (args.serviceAreaIds) {
          where.serviceAreaIds = args.serviceAreaIds;
        }
        if (args.customerGroupId) {
          where.customerGroupId = args.customerGroupId;
        }
        if (args.customerId) {
          where.customerId = args.customerId;
        }
        if (args.customerJobSiteId) {
          where.customerJobSiteId = args.customerJobSiteId;
        }
        if (args.active) {
          where.active = args.active;
        }
        return AppDataSource.manager.findBy(PriceGroups, where);
      },
    },
    priceGroupsHistoricalBy: {
      type: new GraphQLList(priceGroupHistoricalType),
      args: {
        id: { type: GraphQLInt },
        businessUnitId: { type: GraphQLInt },
        businessLineId: { type: GraphQLInt },
        serviceAreaIds: { type: new GraphQLList(GraphQLInt) },
        customerGroupId: { type: GraphQLInt },
        customerId: { type: GraphQLInt },
        customerJobSiteId: { type: GraphQLInt },
        active: { type: GraphQLBoolean },
      },
      description: 'A single price group',
      resolve: (_parent, args: IArgsPriceGroups) => {
        const where: FindOptionsWhere<IWherePriceGroups> = {};
        if (args.id) {
          where.id = args.id;
        }
        if (args.businessLineId) {
          where.businessLineId = args.businessLineId;
        }
        if (args.businessUnitId) {
          where.businessUnitId = args.businessUnitId;
        }
        if (args.serviceAreaIds) {
          where.serviceAreaIds = args.serviceAreaIds;
        }
        if (args.customerGroupId) {
          where.customerGroupId = args.customerGroupId;
        }
        if (args.customerId) {
          where.customerId = args.customerId;
        }
        if (args.customerJobSiteId) {
          where.customerJobSiteId = args.customerJobSiteId;
        }
        if (args.active) {
          where.active = args.active;
        }
        return AppDataSource.manager.findBy(PriceGroups, where);
      },
    },
    lineItemsBy: {
      type: new GraphQLList(lineItemsType),
      description: 'list of lineItems',
      args: {
        id: { type: GraphQLInt },
        order_id: { type: GraphQLInt },
        price: { type: GraphQLInt },
      },
      resolve: (_parent, args: IWhereLineItems) => {
        const where: FindOptionsWhere<IWhereLineItems> = {};
        if (args.id) {
          where.id = args.id;
        }
        if (args.order_id) {
          where.order_id = args.order_id;
        }
        if (args.price_id) {
          where.price_id;
        }

        return AppDataSource.manager.findBy(LineItems, where);
      },
    },
    orderRequestsBy: {
      type: new GraphQLList(orderRequestType),
      description: 'list of order request',
      args: {
        id: { type: GraphQLInt },
        customer_id: { type: GraphQLInt },
        status: { type: GraphQLString },
        job_site_id: { type: GraphQLInt },
      },
      resolve: (_parent, args: IWhereOrderRequests) => {
        const where: FindOptionsWhere<IWhereOrderRequests> = {};
        if (args.id) {
          where.id = args.id;
        }
        if (args.customer_id) {
          where.customer_id = args.customer_id;
        }
        if (args.status) {
          where.status = args.status;
        }
        if (args.job_site_id) {
          where.job_site_id = args.job_site_id;
        }
        return AppDataSource.manager.findBy(OrderRequests, where);
      },
    },
    ordersBy: {
      type: new GraphQLList(orderType),
      description: 'list of orders',
      args: {
        id: { type: GraphQLInt },
        business_unit_id: { type: GraphQLInt },
        business_line_id: { type: GraphQLInt },
        order_request_id: { type: GraphQLInt },
        is_roll_off: { type: GraphQLBoolean },
        price_id: { type: GraphQLInt },
      },
      resolve: (_parent, args: IWhereOrders) => {
        const where: FindOptionsWhere<IWhereOrders> = {};
        if (args.id) {
          where.id = args.id;
        }
        if (args.business_unit_id) {
          where.business_unit_id = args.business_unit_id;
        }
        if (args.business_line_id) {
          where.business_line_id = args.business_line_id;
        }
        if (args.order_request_id) {
          where.order_request_id = args.order_request_id;
        }
        if (args.is_roll_off) {
          where.is_roll_off = args.is_roll_off;
        }
        if (args.price_id) {
          where.price_id = args.price_id;
        }
        return AppDataSource.manager.findBy(Orders, where);
      },
    },
    pricesBy: {
      type: new GraphQLList(priceType),
      description: 'List of price groups',
      args: {
        id: { type: GraphQLInt },
        price_group_id: { type: GraphQLInt },
        entity_type: { type: GraphQLString },
      },
      resolve: (_parent, args: IWherePrices) => {
        const where: FindOptionsWhere<IWherePrices> = {};
        if (args.id) {
          where.id = args.id;
        }
        if (args.price_group_id) {
          where.price_group_id = args.price_group_id;
        }
        if (args.entity_type) {
          where.entity_type = args.entity_type;
        }
        return AppDataSource.manager.findBy(Prices, where);
      },
    },
    recurrentOrderTemplateBy: {
      type: new GraphQLList(recurrentOrderTemplateType),
      description: 'List of recurrent order template',
      args: {
        id: { type: GraphQLInt },
        business_line_id: { type: GraphQLInt },
        business_unit_id: { type: GraphQLInt },
        status: { type: GraphQLString },
        price_group_id: { type: GraphQLInt },
        price_id: { type: GraphQLInt },
      },
      resolve: (_parent, args: IWhereRecurrentOrderTemplate) => {
        const where: FindOptionsWhere<IWhereRecurrentOrderTemplate> = {};
        if (args.id) {
          where.id = args.id;
        }
        if (args.business_line_id) {
          where.business_line_id = args.business_line_id;
        }
        if (args.business_unit_id) {
          where.business_unit_id = args.business_unit_id;
        }
        if (args.status) {
          where.status = args.status;
        }
        if (args.price_group_id) {
          where.price_group_id = args.price_group_id;
        }
        if (args.price_id) {
          where.price_id = args.price_id;
        }
        return AppDataSource.manager.find(RecurrentOrderTemplate);
      },
    },
    recurrentOrderTemplateHistoricalBy: {
      type: new GraphQLList(recurrentOrderTemplateHistoricalType),
      description: 'List of recurrent order template historical',
      args: {
        id: { type: GraphQLInt },
        business_line_id: { type: GraphQLInt },
        business_unit_id: { type: GraphQLInt },
        status: { type: GraphQLString },
        price_group_id: { type: GraphQLInt },
        price_id: { type: GraphQLInt },
      },
      resolve: (_parent, args: IWhereRecurrentOrderTemplateHistorical) => {
        const where: FindOptionsWhere<IWhereRecurrentOrderTemplateHistorical> = {};
        if (args.id) {
          where.id = args.id;
        }
        if (args.business_line_id) {
          where.business_line_id = args.business_line_id;
        }
        if (args.business_unit_id) {
          where.business_unit_id = args.business_unit_id;
        }
        if (args.status) {
          where.status = args.status;
        }
        if (args.price_group_id) {
          where.price_group_id = args.price_group_id;
        }
        if (args.price_id) {
          where.price_id = args.price_id;
        }
        return AppDataSource.manager.find(RecurrentOrderTemplateHistorical);
      },
    },
    recurrentOrderTemplateLineItemsBy: {
      type: new GraphQLList(recurrentOrderTemplateLineItemsType),
      description: 'List of recurrent order template historical',
      args: {
        id: { type: GraphQLInt },
        recurrent_order_template_id: { type: GraphQLInt },
        price_id: { type: GraphQLInt },
      },
      resolve: (_parent, args: IWhereRecurrentOrderTemplateLineItems) => {
        const where: FindOptionsWhere<IWhereRecurrentOrderTemplateLineItems> = {};

        if (args.id) {
          where.id = args.id;
        }
        if (args.recurrent_order_template_id) {
          where.recurrent_order_template_id = args.recurrent_order_template_id;
        }
        if (args.price_id) {
          where.price_id = args.price_id;
        }
        return AppDataSource.manager.find(RecurrentOrderTemplateLineItems);
      },
    },
    recurrentOrderTemplateLineItemsHistoricalBy: {
      type: new GraphQLList(recurrentOrderTemplateLineItemsHistoricalType),
      description: 'List of recurrent order template line items historical',
      args: {
        id: { type: GraphQLInt },
        recurrent_order_template_id: { type: GraphQLInt },
        price_id: { type: GraphQLInt },
      },
      resolve: (_parent, args: IWhereRecurrentOrderTemplateLineItemsHistorical) => {
        const where: FindOptionsWhere<IWhereRecurrentOrderTemplateLineItemsHistorical> = {};
        if (args.id) {
          where.id = args.id;
        }
        if (args.recurrent_order_template_id) {
          where.recurrent_order_template_id = args.recurrent_order_template_id;
        }
        if (args.price_id) {
          where.price_id = args.price_id;
        }
        return AppDataSource.manager.find(RecurrentOrderTemplateLineItemsHistorical);
      },
    },
    customRatesGroupsHistorical: {
      type: new GraphQLList(customRatesGroupsHistoricalType),
      description: 'list of custom rates groups historical',
      resolve: () => AppDataSource.manager.find(CustomRatesGroupsHistorical),
    },
    customRatesGroups: {
      type: new GraphQLList(customRatesGroupsType),
      description: 'list of custom rates groups',
      resolve: () => AppDataSource.manager.find(CustomRatesGroups),
    },
    customRatesGroupServices: {
      type: new GraphQLList(customRatesGroupServicesType),
      description: 'list of custom rates groups services',
      resolve: () => AppDataSource.manager.find(CustomRatesGroupServices),
    },
    customRatesGroupsBy: {
      type: new GraphQLList(customRatesGroupsType),
      args: {
        id: { type: GraphQLInt },
        businessUnitId: { type: GraphQLInt },
        businessLineId: { type: GraphQLInt },
        customerGroupId: { type: GraphQLInt },
        customerId: { type: GraphQLInt },
        customerJobSiteId: { type: GraphQLInt },
        active: { type: GraphQLBoolean },
        skip: { type: GraphQLInt },
        limit: { type: GraphQLInt },
        type: { type: GraphQLString },
        serviceAreaIds: { type: new GraphQLList(GraphQLInt) },
      },
      description: 'A single custom rates group',
      resolve: (_parent, args) => customRatesGroupsResolver(args as ICustomRatesGroupsResolver),
    },
    selectRatesGroup: {
      type: new GraphQLList(customRatesGroupsType),
      args: {
        businessUnitId: { type: GraphQLInt },
        businessLineId: { type: GraphQLInt },
        customerGroupId: { type: GraphQLInt },
        customerJobSiteId: { type: GraphQLInt },
        customerId: { type: GraphQLInt },
        serviceDate: { type: GraphQLString },
        serviceAreaId: { type: GraphQLInt },
      },
      description: 'Select custom rates group',
      resolve: (_parent, args) => selectRatesGroupResolver(args as IWhere),
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
});

export default graphqlHTTP({
  schema,
  graphiql: true,
});
