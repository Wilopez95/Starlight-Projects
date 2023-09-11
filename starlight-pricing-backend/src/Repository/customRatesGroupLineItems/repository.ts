import * as _ from 'lodash';
import { isEmpty } from 'lodash';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AppDataSource } from '../../data-source';
import { CustomRatesGroupLineItems } from '../../database/entities/tenant/CustomRatesGroupLineItems';
import { CustomRatesGroupRecurringLineItemBillingCycle } from '../../database/entities/tenant/CustomRatesGroupRecurringLineItemBillingCycle';
import { isNumericOrNaN } from '../../utils/isNumericOrNAN';
import {
  IRatesToRemove,
  IRepoCustomRatesGroupLineItems,
  IUpsertManyCustomRatesGroupLineItems,
} from '../../Interfaces/CustomRatesGroupLineItems';
import Sender from '../../services/amqp/sender';
import { AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES } from '../../config/config';
import { haulingBillableLineItemBillingCycleRepo } from '../../services/hauling';

export const upsertManyCustomRatesGroupLineItems = async ({
  where,
  oldData,
  ctx,
}: IUpsertManyCustomRatesGroupLineItems) => {
  const dataBase = AppDataSource.manager;
  const mqSender = new Sender();
  const itemsToRemove: Pick<IRepoCustomRatesGroupLineItems, 'id'>[] = [];
  const data = oldData.filter(item => {
    if (where.customRatesGroupId) {
      item.customRatesGroupId = where.customRatesGroupId;
    }
    if (!item.materialId) {
      item.materialId = null;
    }
    if (isNumericOrNaN(item.price) && !isEmpty(item.billingCycles)) {
      itemsToRemove.push(_.pick(item, ['id']));
      return null;
    }
    if (!_.isEmpty(item.billingCycles)) {
      item.oneTime = false;
      item.materialId = null;
    }
    return item;
  });

  try {
    if (!isEmpty(data)) {
      const allLineItems = data.map(el => _.omit(el, 'billingCycles'));
      const lineItemRates: CustomRatesGroupLineItems[] = await dataBase
        .createQueryBuilder()
        .insert()
        .into(CustomRatesGroupLineItems)
        .values(allLineItems as QueryDeepPartialEntity<CustomRatesGroupLineItems>[])
        .select('*')
        .execute();

      const recurringlineItemRates: CustomRatesGroupRecurringLineItemBillingCycle[] =
        await haulingBillableLineItemBillingCycleRepo(ctx, lineItemRates);
      if (!isEmpty(recurringlineItemRates)) {
        const ratesToRemove: IRatesToRemove[] = [];
        const itemsToUpsert = recurringlineItemRates
          .flat()
          .filter((billingCycle?: CustomRatesGroupRecurringLineItemBillingCycle) => {
            if (!billingCycle) {
              return false;
            }
            if (billingCycle.price === 0) {
              ratesToRemove.push(
                _.pick(billingCycle, [
                  'customRatesGroupRecurringLineItemId',
                  'billableLineItemBillingCycleId',
                ]),
              );
              return false;
            }
            return true;
          });

        if (ratesToRemove.length) {
          await dataBase
            .createQueryBuilder()
            .delete()
            .from(CustomRatesGroupRecurringLineItemBillingCycle)
            .where({ where })
            .execute();
        }

        if (!isEmpty(itemsToUpsert) && AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES) {
          await Promise.all([
            dataBase
              .createQueryBuilder()
              .insert()
              .into(CustomRatesGroupRecurringLineItemBillingCycle)
              .values(itemsToUpsert)
              .select('*')
              .execute(),
            mqSender.sendTo(AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES, {
              customServiceRates: itemsToUpsert,
            }),
          ]);
        }
      }
    }

    if (itemsToRemove.length) {
      await dataBase
        .createQueryBuilder()
        .delete()
        .from(CustomRatesGroupLineItems)
        .where({ where })
        .execute();
    }
  } catch (error: unknown) {
    ctx.logger.error(error);
  }
};
