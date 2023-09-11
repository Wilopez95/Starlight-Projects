import { reset } from '../services/elasticsearch/ElasticSearch.js';

import { createAppContext } from '../utils/koaContext.js';

async function main() {
  const ctx = await createAppContext({ dontCheckToken: true });
  await reset(ctx);
}

main();
