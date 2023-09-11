/* eslint-disable no-console */
import { generateKeyPairSync, randomFillSync } from 'crypto';

const passphrase = randomFillSync(Buffer.alloc(16)).toString('base64');

const keys = generateKeyPairSync('ed25519', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase,
  },
});

console.log('Copy and paste variables into .env:\n');
console.log(`SERVICE_PUBLIC_KEY=${JSON.stringify(keys.publicKey)}`);
console.log(`SERVICE_SECRET_KEY=${JSON.stringify(keys.privateKey)}`);
console.log(`SERVICE_SECRET_KEY_PASSPHRASE=${passphrase}`);

console.log('\n');
