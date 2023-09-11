import { CustomRatesGroupThresholds } from '../database/entities/tenant/CustomRatesGroupThresholds';
import { IWhere } from './GeneralsFilter';

export interface IUpsertManyCustomRatesGroupThresholds {
  where: IWhere;
  oldData: CustomRatesGroupThresholds[];
}
