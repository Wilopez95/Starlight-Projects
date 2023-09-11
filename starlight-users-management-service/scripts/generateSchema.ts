import { resolve, join } from 'path';

import 'reflect-metadata';

import { emitSchemaDefinitionFileSync } from 'type-graphql';

import { schema } from '../src/graphql/schema';

const main = (): void => {
  emitSchemaDefinitionFileSync(resolve(join(process.cwd(), 'schema.gql')), schema);
  // eslint-disable-next-line no-console
  console.log('emitted', resolve(join(process.cwd(), 'schema.gql')));
};

main();
