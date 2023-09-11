import bcrypt from 'bcrypt';

import { PASSWORD_HASHING_ROUNDS } from '../../../config.js';

export const hashPassword = async password => {
  const hash = await bcrypt.hash(password, Number(PASSWORD_HASHING_ROUNDS));
  return hash;
};

export const compareHashes = async (password, hash) => {
  const result = await bcrypt.compare(password, hash);
  return result;
};
