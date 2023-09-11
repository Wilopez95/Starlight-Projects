import { camelCase, upperFirst } from 'lodash-es';

export const pascalCase = (str: string) => upperFirst(camelCase(str));
