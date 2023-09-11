import { CustomerCommentRequest, ICustomerComment } from '@root/types';

import { haulingHttpClient, RequestQueryParams } from '../base';

export class CustomerCommentService {
  private getBaseUrl(customerId: number) {
    return `customers/${customerId}/profile/comments`;
  }

  get<Resp = ICustomerComment[]>(customerId: number, options: RequestQueryParams = {}) {
    return haulingHttpClient.get<ICustomerComment[], Resp>(this.getBaseUrl(customerId), options);
  }

  create<Resp = ICustomerComment>(
    customerId: number,
    newEntity: CustomerCommentRequest,
    options: RequestQueryParams = {},
  ) {
    return haulingHttpClient.post<ICustomerComment, Resp>(
      this.getBaseUrl(customerId),
      newEntity,
      options,
    );
  }

  patch<Resp = ICustomerComment>(
    customerId: number,
    id: number,
    entity: CustomerCommentRequest,
    options: RequestQueryParams = {},
  ) {
    return haulingHttpClient.patch<ICustomerComment, Resp>({
      url: `${this.getBaseUrl(customerId)}/${id}`,
      data: entity,
      queryParams: options,
    });
  }

  delete(customerId: number, id: number) {
    return haulingHttpClient.delete(`${this.getBaseUrl(customerId)}/${id}`);
  }
}
