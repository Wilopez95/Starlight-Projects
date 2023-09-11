import * as crypto from 'crypto';

export const deriveKey = (
  alg: string,
  key: string,
  keyLength: number,
  salt: string | crypto.KeyObject | Buffer = '',
  info: string | Buffer = Buffer.from(''),
): crypto.KeyObject => {
  const prk = crypto.createHmac(alg, salt).update(key).digest();

  let prev = Buffer.alloc(0);
  const buffers = [];
  const numBlocks = Math.ceil(keyLength / prk.length);

  for (let i = 0; i < numBlocks; i++) {
    prev = crypto.createHmac(alg, prk).update(prev).update(info).digest();
    buffers.push(prev);
  }

  return crypto.createSecretKey(Buffer.concat(buffers, keyLength));
};
