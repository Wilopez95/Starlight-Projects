import db from '../db/connection.js';

import es from '../services/elasticsearch/sync.js';
import mq from '../services/amqp/index.js';

import { createAppContext } from '../utils/koaContext.js';

import { ES_RESYNC_FORCED } from '../config.js';

const main = async () => {
  const ctx = await createAppContext({ dontCheckToken: true });

  await db.sync();
  await mq.sync();
  // eslint-disable-next-line import/no-named-as-default-member
  await es.sync(ctx, { appInit: true, resyncRequired: !!ES_RESYNC_FORCED });

  // eslint-disable-next-line no-process-exit
  process.exit(0);
};

export default main();
