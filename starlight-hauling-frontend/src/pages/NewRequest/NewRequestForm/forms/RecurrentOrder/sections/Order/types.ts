import { IOrderSummarySection } from '../../../Order/types';
import { INewRecurrentOrderFormData, RecurrentFormBasePath } from '../../types';

export interface IOrderSection {
  basePath: RecurrentFormBasePath;
  serviceAreaId?: number;
  orderData?: INewRecurrentOrderFormData & IOrderSummarySection;
}
