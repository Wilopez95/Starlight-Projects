const isProperObject = obj =>
  obj && typeof obj === 'object' && !Array.isArray(obj) && !(obj instanceof Date);

export default isProperObject;
