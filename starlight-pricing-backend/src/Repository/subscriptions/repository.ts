import { DataSource, IsNull, Not } from 'typeorm';
import { subscriptionServiceName } from '../../utils/subscriptionServiceName';
import { SubscriptionServiceItem } from '../../database/entities/tenant/SubscriptionServiceItem';
import { SubscriptionOrders } from '../../database/entities/tenant/SubscriptionOrders';
import { BaseController } from '../../controllers/base.controller';
import { ISubscriptionExtends } from '../../Interfaces/Subscriptions';
import { Context } from '../../Interfaces/Auth';
import { IGeneralData, IRequesParamsGeneral } from '../../Interfaces/GeneralData';
import { ISubscriptionServiceItem } from '../../Interfaces/SubscriptionServiceItem';
import { ISubscriptionOrders } from '../../Interfaces/SubscriptionOrders';
import { getOrderData } from './../../request/haulingRequest';
export class SubscriptionsRespository extends BaseController {
  async extendSubscription(ctx: Context, data: ISubscriptionExtends[]) {
    let response: ISubscriptionExtends[] = [];
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    response = await Promise.all(
      data.map(async elementSubs => {
        const requestbody1 = {
          jobSiteId: elementSubs.jobSiteId,
          customerId_Histo: elementSubs.customerId,
          businessLineId: elementSubs.businessLineId,
          businessUnitId: elementSubs.businessUnitId,
          serviceAreaId: elementSubs.serviceAreaId,
        };
        const haulingData: IGeneralData = await getOrderData(ctx, { data: requestbody1 });
        const serviceItems: ISubscriptionServiceItem[] = await dataSource.manager
          .createQueryBuilder()
          .select('serviceItems')
          .from(SubscriptionServiceItem, 'serviceItems')
          .leftJoinAndMapMany(
            'serviceItems.lineItems', // Row to map the information
            'SubscriptionLineItem', // Entity or table
            'lineItems', // Alias
            'serviceItems.id = lineItems.subscriptionServiceItemId', //Condition
          )
          .leftJoinAndMapMany(
            'serviceItems.subscriptionOrders', // Row to map the information
            'SubscriptionOrders', // Entity or table
            'subscriptionOrders', // Alias
            'serviceItems.id = subscriptionOrders.subscriptionServiceItemId', //Condition
          )
          .where({ subscriptionId: elementSubs.id })
          .andWhere({ billingCycle: Not(IsNull()) })
          .getMany();

        for (let index = 0; index < serviceItems.length; index++) {
          const element = serviceItems[index];
          const ids: number[] = [];
          const requestbody2: IRequesParamsGeneral = {
            materialId: element.materialId,
            billableServiceId: element.billableServiceId,
          };
          if (serviceItems[index].serviceFrequencyId) {
            ids.push(serviceItems[index].serviceFrequencyId);
            requestbody2.frequencyIds = ids;
          }
          const serviceItemsData: IGeneralData = await getOrderData(ctx, { data: requestbody2 });
          element.billableService = serviceItemsData.billableService;
          if (serviceItemsData.material) {
            element.material = serviceItemsData.material;
          }
          if (serviceItemsData.frequencies) {
            element.serviceFrequency = serviceItemsData.frequencies;
            elementSubs.serviceFrequencyAggregated = serviceItemsData.frequencies[0];
          }

          element.subscriptionOrders = await Promise.all(
            element.subscriptionOrders?.map(async subsOrder => {
              const requestbody3 = {
                billableServiceId: subsOrder.billableServiceId,
              };
              const haulingDataSubsOrder: IGeneralData = await getOrderData(ctx, {
                data: requestbody3,
              });
              return Object.assign(subsOrder, haulingDataSubsOrder);
            }) ?? [],
          );
          element.lineItems = await Promise.all(
            element.lineItems?.map(async lineItem => {
              const requestbody = {
                billableLineItemId: lineItem.billableLineItemId,
              };
              const haulingDataLineItem = await getOrderData(ctx, {
                data: requestbody,
              });
              return Object.assign(lineItem, haulingDataLineItem);
            }) ?? [],
          );
        }
        elementSubs.serviceName = subscriptionServiceName(serviceItems);
        elementSubs.serviceItems = serviceItems;

        const serviceData = (await dataSource
          .createQueryBuilder()
          .select('subsOrders')
          .from(SubscriptionOrders, 'subsOrders')
          .leftJoinAndMapOne(
            'subsOrders.tempNextServiceDate',
            'SubscriptionServiceItem',
            'subServiceItem',
            'subsOrders.subscriptionServiceItemId = subServiceItem.id',
          )
          .where({ subscriptionId: elementSubs.id })
          .getMany()) as ISubscriptionOrders[];

        const nextServiceDate = serviceData.find(
          (servicedate: ISubscriptionOrders) =>
            servicedate.tempNextServiceDate.subscriptionId == elementSubs.id,
        )?.serviceDate;

        const lastSubOrderDate = serviceData.sort(
          (a: ISubscriptionOrders, b: ISubscriptionOrders) => {
            return b.serviceDate.getTime() - a.serviceDate.getTime();
          },
        );

        return {
          ...elementSubs,
          serviceArea: haulingData.serviceArea,
          jobSite: haulingData.jobSite,
          customer: haulingData.customer,
          businessLine: haulingData.businessLine,
          businessUnit: haulingData.businessUnit,
          nextServiceDate,
          lastSubOrderDate:
            lastSubOrderDate.length > 0 ? lastSubOrderDate[0].serviceDate : nextServiceDate,
        };
      }),
    );
    await dataSource.destroy();

    return response;
  }

  async extendSubscriptionTenant(ctx: Context, data: ISubscriptionExtends[], tenantName: string) {
    let response: ISubscriptionExtends[] = [];
    const dataSource: DataSource = await BaseController.getDataSource(tenantName);

    response = await Promise.all(
      data.map(async elementSubs => {
        elementSubs.businessUnitId = elementSubs.business_line_id;
        elementSubs.businessLineId = elementSubs.business_unit_id;

        const serviceItems: ISubscriptionServiceItem[] = await dataSource.manager
          .createQueryBuilder()
          .select('serviceItems')
          .from(SubscriptionServiceItem, 'serviceItems')
          .leftJoinAndMapMany(
            'serviceItems.lineItems', // Row to map the information
            'SubscriptionLineItem', // Entity or table
            'lineItems', // Alias
            'serviceItems.id = lineItems.subscriptionServiceItemId', //Condition
          )
          .leftJoinAndMapMany(
            'serviceItems.subscriptionOrders', // Row to map the information
            'SubscriptionOrders', // Entity or table
            'subscriptionOrders', // Alias
            'serviceItems.id = subscriptionOrders.subscriptionServiceItemId', //Condition
          )
          .where({ subscriptionId: elementSubs.id })
          .andWhere({ billingCycle: Not(IsNull()) })
          .getMany();

        for (let index = 0; index < serviceItems.length; index++) {
          const element = serviceItems[index];
          const ids: number[] = [];
          const requestbody: IRequesParamsGeneral = {
            billableServiceId: element.billableServiceId,
          };
          if (serviceItems[index].serviceFrequencyId) {
            ids.push(serviceItems[index].serviceFrequencyId);
            requestbody.frequencyIds = ids;
          }
          const serviceItemsData = await getOrderData(ctx, { data: requestbody });
          element.billableService = serviceItemsData.billableService;

          if (serviceItemsData.frequencies) {
            element.serviceFrequency = serviceItemsData.frequencies;
            elementSubs.serviceFrequencyAggregated = serviceItemsData.frequencies[0];
          }
        }
        elementSubs.serviceName = subscriptionServiceName(serviceItems);
        elementSubs.serviceItems = serviceItems;
        return elementSubs;
      }),
    );
    await dataSource.destroy();

    return response;
  }
}
