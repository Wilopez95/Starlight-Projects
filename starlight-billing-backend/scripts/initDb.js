import { syncDb } from '../db/connection.js';

import mq from '../services/amqp/index.js';

const main = async () => {
  await syncDb();
  await mq.sync();

  // eslint-disable-next-line no-process-exit
  process.exit(0);
};

export default main();
