import { OrderStatus } from '../../../graphql/api';

export default function isCompletedOrFinalized(status: OrderStatus) {
  return [OrderStatus.Completed, OrderStatus.Finalized].includes(status);
}
