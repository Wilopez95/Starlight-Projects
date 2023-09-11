import { constants } from 'zlib';

import compress from 'koa-compress';

export const compression = compress({
  threshold: 2048,
  gzip: { flush: constants.Z_SYNC_FLUSH },
  deflate: { flush: constants.Z_SYNC_FLUSH },
});
