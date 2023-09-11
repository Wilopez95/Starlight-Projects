import collectSeeds from './helpers/collectSeeds.js';

const seed = async (knex, config) => {
  const seeds = await collectSeeds(config);

  await seeds.reduce(
    (prevSeed, nextSeed) => prevSeed.then(() => nextSeed.seed(knex)),
    Promise.resolve(),
  );
};

export default seed;
