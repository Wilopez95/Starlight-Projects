import { randomFillSync } from 'crypto';
import { logger } from '../src/services/logger';

const SECRET_KEY_LENGTH = 32;

const generateKey = () => {
  const buf = Buffer.allocUnsafe(SECRET_KEY_LENGTH);
  randomFillSync(buf);

  logger.info(buf.toString('base64'));
};

generateKey();
