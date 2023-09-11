import axios from 'axios';
import { map, share } from 'rxjs/operators';
import {
  AMQP_QUEUE_BUSINESS_UNITS,
  CORE_SERVICE_API_URL,
  TRACING_HEADER,
  AMQP_BUSINESS_UNITS_EXCHANGE,
} from '../../config';
import { observeOn } from '../queue';
import { BusinessLine, BusinessUnit } from './types/BusinessUnit';
import { parseFacilitySrn } from '../../utils/srn';
import { HaulingHttpCrudService, PartialContext } from '../../graphql/createHaulingCRUDResolver';

export { BusinessUnit, BusinessUnitInput } from './types/BusinessUnit';

export interface BusinessUnitEvent {
  tenantName: string;
  tenantId: string;
  id: number;
  type: string;
  loginUrl: string;
}

export enum BusinessUnitType {
  RECYCLING_FACILITY = 'recyclingFacility',
  HAULING = 'hauling',
}

export class BusinessUnitsFilter {
  type?: BusinessUnitType;
}

export const businessUnitsObservable = observeOn<BusinessUnitEvent>({
  type: AMQP_QUEUE_BUSINESS_UNITS,
  assertQueue: true,
  bindings: [
    {
      exchange: AMQP_BUSINESS_UNITS_EXCHANGE,
      routingKey: '',
      type: 'fanout',
      options: { durable: true },
    },
  ],
}).pipe(
  map((message) => message.payload),
  share(),
);

export const getBusinessUnit = async (
  ctx: PartialContext,
  authorization?: string,
): Promise<BusinessUnit> => {
  const auth = authorization || (await HaulingHttpCrudService.getAuthorizationHeader(ctx));
  const { businessUnitId } = parseFacilitySrn(ctx.userInfo.resource!);

  const response = await axios.get<BusinessUnit>(
    `${CORE_SERVICE_API_URL}/business-units/${businessUnitId}`,
    {
      headers: {
        Authorization: auth,
        [TRACING_HEADER]: ctx.reqId,
      },
    },
  );

  return response.data;
};

export const getBusinessLine = async (
  ctx: PartialContext,
  authorization?: string,
): Promise<BusinessLine> => {
  const bu = await getBusinessUnit(ctx, authorization);

  if (bu.businessLines.length === 0) {
    throw new Error('Failed to get business line id');
  }

  return bu.businessLines[0];
};
