import { resolve } from 'path';
import { promises as fsPromises } from 'fs';
import { pathToFileURL } from 'url';

import sortBy from 'lodash/fp/sortBy.js';

import handleIoError from './handleIoError.js';
import stripFileExtension from './stripFileExtension.js';

const collectSeeds = async ({ seedsDirectory }) => {
  let seedFileNames;

  try {
    seedFileNames = await fsPromises.readdir(seedsDirectory);
  } catch (error) {
    return handleIoError(seedsDirectory, error, []);
  }

  if (seedFileNames.length === 0) {
    return seedFileNames;
  }

  const seeds = (
    await Promise.all(
      seedFileNames.map(file => import(pathToFileURL(resolve(seedsDirectory, file)))),
    )
  ).map((m, i) => ({ name: stripFileExtension(seedFileNames[i]), seed: m.default }));

  return sortBy('name')(seeds);
};

export default collectSeeds;
