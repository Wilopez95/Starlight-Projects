import * as _ from 'lodash';
import { isEmpty } from 'lodash';
import { AppDataSource } from '../../data-source';
import { CustomRatesGroupSurcharges } from '../../database/entities/tenant/CustomRatesGroupSurcharges';
import {
  IUpsertManyCustomRatesGroupSurcharges,
  TypePickCustomRatesGroupSurcharges,
} from '../../Interfaces/CustomRatesGroupSurcharges';
import { isNumericOrNaN } from '../../utils/isNumericOrNAN';

export const upsertManyCustomRatesGroupSurcharges = async ({
  where,
  oldData,
}: IUpsertManyCustomRatesGroupSurcharges) => {
  const dataBase = AppDataSource.manager;
  const itemsToRemove: TypePickCustomRatesGroupSurcharges[] = [];
  const data = oldData.filter((item: CustomRatesGroupSurcharges) => {
    if (where.customRatesGroupId) {
      item.customRatesGroupId = where.customRatesGroupId;
    }

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
      .into(CustomRatesGroupSurcharges)
      .values(data)
      .select('*')
      .execute();
  }

  if (!isEmpty(itemsToRemove)) {
    await dataBase
      .createQueryBuilder()
      .delete()
      .from(CustomRatesGroupSurcharges)
      .where({ where })
      .execute();
  }
};
