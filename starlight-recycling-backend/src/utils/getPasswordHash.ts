import { createHmac } from 'crypto';

export const getPasswordHash = (password: string): string => {
  return createHmac('sha256', password).digest('hex');
};

export default getPasswordHash;
