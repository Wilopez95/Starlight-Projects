import { UpdateStatusRequest } from '@root/stores/subscriptionOrder/types';

export type UpdateStatusFunction = (options: UpdateStatusRequest) => Promise<void>;
