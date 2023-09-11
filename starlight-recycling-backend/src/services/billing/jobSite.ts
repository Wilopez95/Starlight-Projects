import { enqueue } from '../queue';
import { AMQP_QUEUE_JOB_SITES_TO_BILLING } from '../../config';

export interface JobSiteEvent {
  /**
   * required
   */
  schemaName: string;

  id: number;

  /** minLength 1 */
  addressLine1: string;
  addressLine2: string | null;

  /** minLength 1 */
  city: string;
  state: string;
  /** minLength 5 */
  zip: string;
}

export const sendJobSiteEvent = (event: JobSiteEvent): void => {
  enqueue({
    type: AMQP_QUEUE_JOB_SITES_TO_BILLING,
    payload: event,
  });
};
