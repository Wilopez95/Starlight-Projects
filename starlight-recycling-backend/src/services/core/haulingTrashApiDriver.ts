import { HaulingHttpCrudService } from '../../graphql/createHaulingCRUDResolver';
import { HaulingDriver } from '../../modules/recycling/entities/HaulingDriver';

export class HaulingTrashApiDriver extends HaulingHttpCrudService<HaulingDriver> {
  path = 'trash-api/drivers';
}
