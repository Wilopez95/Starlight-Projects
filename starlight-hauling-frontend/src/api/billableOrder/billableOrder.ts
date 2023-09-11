import { BaseGraphqlService } from '../base';
import { type GraphqlVariables } from '../base/types';

import { type GetOrderReceiptResponse } from './types';

export class BillableOrderService extends BaseGraphqlService {
  getOrderReceiptAttachments(variables: GraphqlVariables & { orderId: number }) {
    return this.graphql<GetOrderReceiptResponse>(
      `query getOrderReceipt($orderId: ID!) {
        order(id: $orderId) {
          payments {
            receiptPdfUrl
            receiptPreviewUrl
          }
        }
      }`,
      variables,
    );
  }
}
