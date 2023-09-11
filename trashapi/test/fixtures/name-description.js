import Chance from 'chance';

const chance = new Chance();

export default ({
  name = chance.word(),
  description = chance.string(),
} = {}) => ({
  name,
  description,
});
