import { customAlphabet, urlAlphabet } from 'nanoid';

export const generateRandomId = customAlphabet(urlAlphabet, 64);
export const generateRandomPassword = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+=-/?.>,<[]{}\\~|;:\'"`',
  64,
);
