import Chance from 'chance';

const chance = new Chance();

export default ({
  name = chance.word(),
  username = chance.word(),
  photo = chance.word(),
} = {}) => ({
  name,
  username,
  photo,
});
