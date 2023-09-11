import crypto from 'crypto';

export const generateId = () => {
  let generatedId = '{';
  generatedId += `${crypto.randomUUID()}}`;
  return generatedId;
};
