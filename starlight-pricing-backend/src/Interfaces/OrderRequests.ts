import { OrderRequests } from '../database/entities/tenant/OrderRequests';

export interface IOrderRequestsResolver {
  order_request_id: number;
}

export interface IWhereOrderRequests extends OrderRequests {
  customer_id?: number | string | null;
  job_site_id?: number | string | null;
}
