import { HaulingBillableItem } from '../../modules/recycling/entities/BillableItem';
import { HaulingHttpCrudService } from '../../graphql/createHaulingCRUDResolver';

export class HaulingBillableItemsHttpService extends HaulingHttpCrudService<HaulingBillableItem> {
  path = 'billable/line-items';
}
