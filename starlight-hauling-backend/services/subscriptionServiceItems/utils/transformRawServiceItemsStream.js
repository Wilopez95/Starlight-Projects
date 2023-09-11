import { Transform } from 'stream';

import { serviceItemStreamResponseMapper } from './serviceItemStreamResponseMapper.js';

export const getTransformRawServiceItemsStream = () => {
  const start = '[';
  const end = ']';
  const separator = ',';
  let isStarted = false;

  const transform = new Transform({
    objectMode: true,

    transform(chunk, encoding, cb) {
      if (isStarted) {
        this.push(separator);
      } else {
        this.push(start);
        isStarted = true;
      }

      const serviceItem = serviceItemStreamResponseMapper.mapServiceItem(chunk);

      this.push(JSON.stringify(serviceItem));
      cb();
    },
    flush(cb) {
      if (!isStarted) {
        this.push(start);
      }

      this.push(end);
      this.push(null);
      cb();
    },
  });

  return transform;
};
