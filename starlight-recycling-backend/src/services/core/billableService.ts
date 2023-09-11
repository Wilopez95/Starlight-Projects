import { BillableService, BillableServiceAction } from './types/BillableService';
import { HaulingHttpCrudService, PartialContext } from '../../graphql/createHaulingCRUDResolver';
import { getBusinessUnit } from './business_units';
import { OrderType } from '../../modules/recycling/entities/Order';

const orderTypeBillableServiceActionMap = {
  [OrderType.DUMP]: BillableServiceAction.dump,
  [OrderType.LOAD]: BillableServiceAction.load,
};

export class HaulingBillableServiceHttpService extends HaulingHttpCrudService<BillableService> {
  path = 'billable/services';

  async getByType(
    ctx: PartialContext,
    type: OrderType,
    authorization?: string,
  ): Promise<BillableService> {
    const auth = authorization || (await HaulingHttpCrudService.getAuthorizationHeader(ctx));
    const businessUnit = await getBusinessUnit(ctx, auth);
    const businessLineIds = businessUnit.businessLines[0]?.id;
    const response = await super.get(
      ctx,
      {
        activeOnly: true,
        businessLineIds,
        oneTime: true,
      },
      undefined,
      undefined,
      auth,
    );

    if (type === OrderType.NON_SERVICE) {
      throw new Error('Non service order is not defined');
    }

    const billableService = response.data.find(
      (billableService) => billableService.action === orderTypeBillableServiceActionMap[type],
    );

    if (!billableService) {
      throw new Error('Billable Service not found');
    }

    return billableService;
  }
}

export const httpBillableService = new HaulingBillableServiceHttpService();
