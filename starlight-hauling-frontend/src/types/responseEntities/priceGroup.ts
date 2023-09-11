import { ICustomerGroup } from '../entities';
import { IPriceGroup } from '../entities/priceGroup';

export interface IResponsePriceGroup extends IPriceGroup {
  customerGroup: ICustomerGroup;
}
