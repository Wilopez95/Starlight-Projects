import { createWorker } from './workerWithLogger';
import { getFacilityEntitiesAndConnection } from '../utils/facilityConnection';
import { v4 as uuidV4 } from 'uuid';
import { EditHaulingOrderEvent, QUEUE_NAME } from '../queues/editHaulingOrder';
import { editHaulingOrder } from '../graphql/resolvers/OrderResolver';
import { QueryContext } from '../../../types/QueryContext';

export const worker = createWorker<EditHaulingOrderEvent>(QUEUE_NAME, async (job) => {
  const { orderId, resource, userInfo, reqId = uuidV4() } = job.data;

  if (!orderId) {
    job.info('OrderId is missing');
    job.info('Stop worker');
    await job.updateProgress(100);

    return;
  }

  const [, connectionEntities] = await getFacilityEntitiesAndConnection(resource);

  try {
    await editHaulingOrder(
      {
        userInfo,
        reqId,
        resource,
        ...connectionEntities,
      } as QueryContext,
      orderId,
    );
  } catch (e) {
    job.error(e.response?.data || e, e.message);
  }

  job.info('Stop worker');
  await job.updateProgress(100);

  return;
});
