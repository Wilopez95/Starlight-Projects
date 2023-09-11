import cloneDeep from 'lodash/cloneDeep.js';
import batchRates from '../batchRatesUpdate/batchRates.js';
import ctx from './mocks/ctx.js';
import { baseInput } from './data/batchUpdate/batchRatesUpdate.js';
import repos from './mocks/batchUpdate/repos/repos.js';

jest.mock('../../../utils/unitsConvertor.js');

describe.skip('batchUpdatePrices', () => {
  let input = {};

  beforeEach(() => {
    input = cloneDeep(baseInput);
  });

  test('batch update all', async () => {
    const result = await batchRates(ctx.state, input, undefined, repos);
    expect(result).toMatchSnapshot();
  });

  test('batch update lineItems', async () => {
    input.target = 'lineItems';
    input.value = 33;
    input.calculation = 'percentage';

    const result = await batchRates(ctx.state, input, undefined, repos);
    expect(result).toMatchSnapshot();
  });

  test.skip('no price', async () => {
    input.target = 'recurringLineItems';
    input.source = 'current';
    input.value = 72;

    expect(await batchRates(ctx.state, input, undefined, repos)).toThrow('No prices found');
    // expect(result).toMatchSnapshot();
  });

  test('batch update recurringServices', async () => {
    input.target = 'recurringServices';
    input.source = 'global';
    input.value = 50;
    input.calculation = 'percentage';
    const result = await batchRates(ctx.state, input, undefined, repos);
    expect(result).toMatchSnapshot();
  });

  test.skip('conflict', async () => {
    input.overridePrices = false;

    expect(await batchRates(ctx.state, input, undefined, repos)).toThrow(
      'Price already overridden',
    );
    // expect(result).toMatchSnapshot();
  });

  test('isPreview', async () => {
    const result = await batchRates(ctx.state, input, { isPreview: true }, repos);
    expect(result).toMatchSnapshot();
  });
});
