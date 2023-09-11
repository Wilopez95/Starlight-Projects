import * as _ from 'lodash';
import { AppDataSource } from '../../data-source';
import { CustomRatesGroupThresholds } from '../../database/entities/tenant/CustomRatesGroupThresholds';
import { isNumericOrNaN } from '../../utils/isNumericOrNAN';
import { IUpsertManyCustomRatesGroupThresholds } from '../../Interfaces/CustomRatesGroupThresholds';

export const upsertManyCustomRatesGroupThresholds = async ({
  where,
  oldData,
}: IUpsertManyCustomRatesGroupThresholds) => {
  const dataBase = AppDataSource.manager;
  const itemsToRemove: Pick<CustomRatesGroupThresholds, 'id'>[] = [];
  const data = oldData.filter((item: CustomRatesGroupThresholds) => {
    item.customRatesGroupId = where.customRatesGroupId as number;
    if (isNumericOrNaN(item.price)) {
      itemsToRemove.push(_.pick(item, ['id']));
      return null;
    }
    return item;
  });

  if (data.length) {
    await dataBase
      .createQueryBuilder()
      .insert()
      .into(CustomRatesGroupThresholds)
      .values(data)
      .select('*')
      .execute();
  }

  if (itemsToRemove.length) {
    await dataBase
      .createQueryBuilder()
      .delete()
      .from(CustomRatesGroupThresholds)
      .where({ where })
      .execute();
  }
};
