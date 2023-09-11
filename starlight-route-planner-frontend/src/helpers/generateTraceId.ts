import { customAlphabet } from 'nanoid';

export const generateTraceId = customAlphabet('1234567890abcdef', 64);
