import { convertLocationFormat } from '../convertLocationFormat';

const addresFour =
  '11450 Broomfield Ln, Broomfield, Colorado 80021, United States of America';

const addressFive =
  '1st Bank Center, 11450 Broomfield Ln, Broomfield, Colorado 80021, United States of America';

describe('convertLocationFormat', () => {
  it('it should replace the state with the abbrv and without United States of America', () => {
    const correctAddress = '11450 Broomfield Ln, Broomfield, CO, 80021';
    expect(convertLocationFormat(addresFour)).toEqual(correctAddress);
  });
  it('it should accept a Place Name in the address and return proper formatting', () => {
    const correctAddress =
      '1st Bank Center, 11450 Broomfield Ln, Broomfield, CO, 80021';
    expect(convertLocationFormat(addressFive)).toEqual(correctAddress);
  });
});
