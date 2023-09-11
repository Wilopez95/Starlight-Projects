import { generateKeyPairSync } from 'crypto'

const keys = generateKeyPairSync('ed25519',
{
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-gcm',
    passphrase: 'top secret',
  },
});

console.log('Copy and paste variables into .env:\n');
console.log(`SERVICE_PUBLIC_KEY=${JSON.stringify(keys.publicKey)}`);
console.log(`SERVICE_SECRET_KEY=${JSON.stringify(keys.privateKey)}`);
console.log(`SERVICE_SECRET_KEY_PASSPHRASE=top secret`);
// console.log(`TOKEN_SECRET=${crypto.randomFillSync(Buffer.alloc(32)).toString('base64')}`);
console.log('\n');

// crypto.randomFillSync(Buffer.alloc(32)).toString('base64')