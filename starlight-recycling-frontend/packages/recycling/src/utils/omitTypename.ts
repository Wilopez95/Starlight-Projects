import { omit } from 'lodash/fp';

const omitTypename: <T extends Record<string, any>>(value: T) => Omit<T, '__typename'> = omit([
  '__typename',
]);

export default omitTypename;
