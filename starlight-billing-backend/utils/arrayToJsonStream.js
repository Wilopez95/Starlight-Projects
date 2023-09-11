import { PassThrough } from 'stream';
import zlib from 'zlib';

export default data => {
  const source = new PassThrough({ objectMode: false });

  const l = data.length;
  source.write('[');
  data.forEach((invoice, i) => source.write(`${JSON.stringify(invoice)}${i === l - 1 ? '' : ','}`));
  source.end(']');

  return {
    data: source.pipe(zlib.createGzip()),
    configs: {
      headers: {
        'Content-Type': 'application/json',
        'Accept-Charset': 'utf-8',
        'Content-Encoding': 'gzip',
        'Accept-Encoding': 'gzip',
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    },
  };
};
