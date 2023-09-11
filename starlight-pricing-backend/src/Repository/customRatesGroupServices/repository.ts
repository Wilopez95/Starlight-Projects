import * as _ from 'lodash';
import { isEmpty } from 'lodash';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AppDataSource } from '../../data-source';
import { CustomRatesGroupServices } from '../../database/entities/tenant/CustomRatesGroupServices';
import { CustomRatesGroupRecurringServiceFrequency } from '../../database/entities/tenant/CustomRatesGroupRecurringServiceFrequency';
import Sender from '../../services/amqp/sender';
import {
  ICustomRatesGroupServices,
  ICustomRatesServicesFrequenciesRelations,
  IRatesToRemoveCustomRatesGroupServices,
  IUpsertManyCustomRatesGroupServices,
} from '../../Interfaces/CustomRatesGroupServices';
import { haulingBillableServiceFrequencyRepo } from '../../services/hauling';
import { AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES } from '../../config/config';
import { IBillableServiceFrequency } from '../../Interfaces/BillableServiceFrequency';
import { isNumericOrNaN } from '../../utils/isNumericOrNAN';

const mapOmitId = (
  items: (ICustomRatesServicesFrequenciesRelations[] | null)[] | ICustomRatesGroupServices[],
): Omit<ICustomRatesServicesFrequenciesRelations | ICustomRatesGroupServices, 'id'>[] =>
  items.map(i => _.omit(i, ['id']));

export const upsertManyCustomRatesGroupServices = async ({
  where,
  serviceRatesData,
  duplicate,
  ctx,
}: IUpsertManyCustomRatesGroupServices) => {
  const mqSender = new Sender();
  const dataBase = AppDataSource.manager;
  const itemsToRemove: Pick<ICustomRatesGroupServices, 'id'>[] = [];
  const inputData = serviceRatesData
    .filter((item: ICustomRatesGroupServices) => {
      if (where.customRatesGroupId) {
        item.customRatesGroupId = where.customRatesGroupId;
      }

      if (isNumericOrNaN(item.price) && isEmpty(item.frequencies)) {
        itemsToRemove.push(_.pick(item, ['id']));
        return null;
      }

      return item;
    })
    .map(item => {
      if (!item.price) {
        item.price = 0;
      }
      return item;
    });
  const data = mapOmitId(inputData) as Omit<ICustomRatesGroupServices, 'id'>[];

  try {
    if (data.length) {
      const allServices = data.map(el => _.omit(el, ['frequencies', 'billingCycle']));
      const serviceRates: CustomRatesGroupServices[] = await dataBase
        .createQueryBuilder()
        .insert()
        .into(CustomRatesGroupServices)
        .values(allServices as QueryDeepPartialEntity<CustomRatesGroupServices>)
        .select('*')
        .execute();

      // on duplicate incoming data has no frequencies
      // so we need to create new custom price group billable services frequency relations
      if (duplicate) {
        let customRatesServicesFrequenciesRelations = await Promise.all(
          serviceRatesData.map(async (item: ICustomRatesGroupServices, idx: number) => {
            const freqRelation: ICustomRatesServicesFrequenciesRelations[] = await dataBase.findBy(
              CustomRatesGroupRecurringServiceFrequency,
              {
                customRatesGroupRecurringServiceId: item.id,
              },
            );

            if (!freqRelation.length) {
              return null;
            }

            return freqRelation.map((freq: CustomRatesGroupRecurringServiceFrequency) => ({
              ...freq,
              customRatesGroupRecurringServiceId: serviceRates[idx].id,
            }));
          }),
        );

        if (isEmpty(customRatesServicesFrequenciesRelations)) {
          customRatesServicesFrequenciesRelations = [];
        }

        const existingRelations = mapOmitId(customRatesServicesFrequenciesRelations) as Omit<
          ICustomRatesServicesFrequenciesRelations,
          'id'
        >[];

        if (existingRelations.length) {
          await dataBase
            .createQueryBuilder()
            .insert()
            .into(CustomRatesGroupRecurringServiceFrequency)
            .values(existingRelations)
            .select('*')
            .execute();
        }
      }

      const recurringServiceRates: IBillableServiceFrequency[] =
        await haulingBillableServiceFrequencyRepo(ctx, serviceRates);

      if (recurringServiceRates.length) {
        const ratesToRemove: IRatesToRemoveCustomRatesGroupServices[] = [];
        const ratesToUpsert = recurringServiceRates
          .flat()
          .filter((frequency?: IBillableServiceFrequency) => {
            if (!frequency) {
              return false;
            }
            if (!frequency.price) {
              ratesToRemove.push({
                customRatesGroupRecurringServiceId: frequency.customRatesGroupRecurringServiceId,
                billableServiceFrequencyId: frequency.billableServiceFrequencyId,
                billingCycle: frequency.billingCycle,
              });
              return false;
            }
            return true;
          });

        if (ratesToRemove.length) {
          await dataBase
            .createQueryBuilder()
            .delete()
            .from(CustomRatesGroupRecurringServiceFrequency)
            .where({ where })
            .execute();
        }

        if (!isEmpty(ratesToUpsert) && AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES) {
          await Promise.all([
            dataBase
              .createQueryBuilder()
              .insert()
              .into(CustomRatesGroupRecurringServiceFrequency)
              .values(
                ratesToUpsert as QueryDeepPartialEntity<CustomRatesGroupRecurringServiceFrequency>,
              )
              .select('*')
              .execute(),
            mqSender.sendTo(AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES, {
              customServiceRates: ratesToUpsert,
            }),
          ]);
        }
      }
    }
    if (itemsToRemove.length) {
      await dataBase
        .createQueryBuilder()
        .delete()
        .from(CustomRatesGroupServices)
        .where({ where })
        .execute();
    }
  } catch (error: unknown) {
    ctx.logger.error(error);
    throw error;
  }
};
