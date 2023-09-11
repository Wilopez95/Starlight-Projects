import { populateElasticSearchIndexQueue } from './populateElasticSearchIndex';
import { populateEntityQueue } from './populateEntity';
import { populateOrderIndexedQueue } from './populateOrderIndexed';
import { editHaulingOrderQueue } from './editHaulingOrder';
import { postLackedOrdersAuditLogToHauling } from './postLackedOrdersAuditLogToHauling';

export const queues = [
  populateElasticSearchIndexQueue,
  populateEntityQueue,
  populateOrderIndexedQueue,
  editHaulingOrderQueue,
  postLackedOrdersAuditLogToHauling,
];
