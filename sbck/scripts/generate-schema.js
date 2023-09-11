import path from 'path';
import fs from 'fs';

import { printSchema } from 'graphql';

import { schema } from '../graphql/schema.js';

const outputFileSync = (filePath, fileContent) => {
  try {
    fs.writeFileSync(filePath, fileContent);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
    fs.mkdirSync(filePath, { recursive: true });
    fs.writeFileSync(filePath, fileContent);
  }
};

const main = () => {
  try {
    const printedSchema = printSchema(schema);
    const pathToFile = path.resolve(path.join(process.cwd(), 'schema.gql'));
    outputFileSync(pathToFile, printedSchema);

    console.log('emitted', pathToFile);
  } catch (e) {
    console.error(e);

    throw e;
  }
};

main();
