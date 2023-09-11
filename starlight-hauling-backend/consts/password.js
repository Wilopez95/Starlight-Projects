export const PASSWORD_REGEXP =
  /^(?=[^a-z]*?[a-z])(?=[^A-Z]*?[A-Z])(?=[^0-9]*?[0-9])(?=[^!@#$%^&*[\](){}]*?[!@#$%^&*[\](){}])(?=[a-zA-Z0-9!@#$%^&*[\](){}]*$)/;
export const PASSWORD_MIN_CHARS = 8;
export const PASSWORD_MAX_CHARS = 25;

// Prohibited passwords and the minimum Levenshtein distance a valid password should have with them
export const PROHIBITED_PASSWORDS = {
  patterns: ['password', 'qwerty', '12345678', 'pass'],
  minDistance: 4,
};
