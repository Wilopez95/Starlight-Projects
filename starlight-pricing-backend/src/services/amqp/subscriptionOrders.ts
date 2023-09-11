import { endOfDay } from 'date-fns';
import * as Amqp from 'amqp-ts';
import { DataSource, LessThan, QueryRunner } from 'typeorm';
import { isEmpty } from 'lodash';
import { AppDataSource } from '../../data-source';
import { BaseController } from '../../controllers/base.controller';
import { Tenants } from '../../database/entities/admin/Tenants';
import { batchUpdateSubscriptionOrder } from '../../request/haulingRequest';
import {
  ISubscriptionOrderStatusElement,
  IUpdateSubscriptionOrderStatus,
} from '../../Interfaces/SubscriptionOrders';
import { Context } from '../../Interfaces/Auth';
import ApiError from '../../utils/ApiError';
import { SubscriptionOrders } from './../../database/entities/tenant/SubscriptionOrders';

export const updateSubscriptionOrderStatus = async (_data: Amqp.Message) => {
  const tenantList: Tenants[] = await AppDataSource.manager.find(Tenants);
  if (!isEmpty(tenantList)) {
    for (let index: number = 0; index < tenantList.length; index++) {
      const dataSource: DataSource = await BaseController.getDataSource(tenantList[index].name);
      const queryRunner: QueryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      try {
        const subscriptionOrders = (await queryRunner.manager
          .createQueryBuilder()
          .select('orders')
          .from(SubscriptionOrders, 'orders')
          .innerJoinAndMapOne(
            'orders.subscription',
            'Subscriptions',
            'subscription',
            `subscription.id = orders.subscriptionId`,
          )
          .where({ status: 'SCHEDULED' })
          .andWhere({ serviceDate: LessThan(endOfDay(new Date())) })
          .getMany()) as IUpdateSubscriptionOrderStatus[];

        const requestBody: ISubscriptionOrderStatusElement[] = [];

        for (let indexSO = 0; indexSO < subscriptionOrders.length; indexSO++) {
          const element: ISubscriptionOrderStatusElement = {
            ids: [],
            businessUnitId: subscriptionOrders[indexSO].subscription.businessUnitId,
            status: 'IN_PROGRESS',
            validOnly: false,
          };
          let inserted: Boolean = false;
          for (let validationIndex = 0; validationIndex < requestBody.length; validationIndex++) {
            if (requestBody[validationIndex].businessUnitId === element.businessUnitId) {
              requestBody[validationIndex].ids.push(subscriptionOrders[indexSO].id);
              inserted = true;
              break;
            }
          }
          if (inserted === false) {
            element.ids.push(subscriptionOrders[indexSO].id);
            requestBody.push(element);
          }
        }
        for (let requestIndex = 0; requestIndex < requestBody.length; requestIndex++) {
          const ctx = { state: { user: {} } };
          ctx.state.user = { schemaName: tenantList[index].name };
          await batchUpdateSubscriptionOrder(ctx as unknown as Context, {
            data: requestBody[requestIndex],
          });
        }
      } catch (e: unknown) {
        console.log(e);
        throw ApiError.unknown(`Error: ${e}`);
      } finally {
        await dataSource.destroy();
      }
    }
  } else {
    console.error(`Any Tenant found`);
    throw ApiError.unknown(`Any Tenant found`);
  }
};
