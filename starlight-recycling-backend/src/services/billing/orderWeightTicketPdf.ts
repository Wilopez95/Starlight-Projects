import axios from 'axios';
import { BILLING_SERVICE_API_URL } from '../../config';
import { createToken } from '../../utils/serviceToken';
import { parseFacilitySrn } from '../../utils/srn';
import { getBusinessLine } from '../core/business_units';
import { PartialContext } from '../../graphql/createHaulingCRUDResolver';

export interface OrderWaitTicketPdfParams {
  orderId: number;
  type: string;
  ctx: PartialContext;
}

/**
 * Get weight ticket pdf stream from billing service by order id and ticket's type
 *
 * @param orderId
 * @param type
 * @param ctx
 */
export const orderWeightTicketPdf = async ({
  orderId,
  type,
  ctx,
}: OrderWaitTicketPdfParams): Promise<Buffer> => {
  if (!ctx.userInfo.resource) {
    throw new Error('Failed to get resource from context');
  }

  const { tenantName } = parseFacilitySrn(ctx.userInfo.resource);
  const businessLine = await getBusinessLine(ctx);

  if (!ctx.userInfo.tenantId) {
    throw new Error('Failed to get tenant id');
  }

  const token = await createToken(
    {
      tenantId: ctx.userInfo.tenantId,
      resource: ctx.userInfo.resource,
      subscriberName: tenantName,
      tenantName: ctx.userInfo.resource,
    },
    {
      audience: 'billing',
      subject: ctx.userInfo.id,
      requestId: ctx.reqId,
    },
  );

  const authorizationHeader = `ServiceToken ${token}`;

  try {
    const resDownloadWeightTicket = await axios.get(
      `${BILLING_SERVICE_API_URL}/v1/reports/download-weight-ticket/`,
      {
        headers: {
          Authorization: authorizationHeader,
        },
        params: {
          orderId,
          type,
          businessLineId: businessLine.id,
        },
        responseType: 'arraybuffer',
      },
    );

    return resDownloadWeightTicket?.data;
  } catch (e) {
    throw new Error(
      `Unable to get a weight ticket pdf from the billing service. Error: ${e.message}`,
    );
  }
};
