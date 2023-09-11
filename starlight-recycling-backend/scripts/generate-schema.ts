import 'reflect-metadata';
import { resolve, join } from 'path';
import { emitSchemaDefinitionFileSync } from 'type-graphql';
import { buildSchemaAndExecutor } from '../src/router/graphqlRouter';

const main = async (): Promise<void> => {
  try {
    const { schema } = await buildSchemaAndExecutor();

    await emitSchemaDefinitionFileSync(resolve(join(process.cwd(), 'schema.gql')), schema);

    console.log('emitted', resolve(join(process.cwd(), 'schema.gql')));
  } catch (e) {
    console.error(e);

    process.exit(1);

    return;
  }

  process.exit(0);
};

main();
