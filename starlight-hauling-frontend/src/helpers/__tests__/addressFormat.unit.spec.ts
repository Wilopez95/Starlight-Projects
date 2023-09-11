import { Regions } from '@root/i18n/config/region';

import { addressFormat, addressFormatShort } from '../addressFormat';

describe('addressFormatShort', () => {
  test('should return empty string if input is empty', () => {
    expect(addressFormatShort({})).toStrictEqual('');
  });
  test('should return only addressLine1 if there is no addressLine2', () => {
    expect(addressFormatShort({ addressLine1: 'addressLine1' })).toStrictEqual('addressLine1');
  });
  test('should return only addressLine2 if there is no addressLine1', () => {
    expect(addressFormatShort({ addressLine2: 'addressLine2' })).toStrictEqual('addressLine2');
  });
  test('should return addressLine1 and addressLine2 separated by comma when both specified', () => {
    expect(
      addressFormatShort({
        addressLine1: 'addressLine1',
        addressLine2: 'addressLine2',
      }),
    ).toStrictEqual('addressLine1, addressLine2');
  });
});

describe('addressFormat', () => {
  test('should return empty string if input is empty', () => {
    expect(
      addressFormat({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        region: Regions.US,
      }),
    ).toStrictEqual('');
  });
  test('should return only addressLine1 if there are no other fields', () => {
    expect(
      addressFormat({
        addressLine1: 'addressLine1',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        region: Regions.US,
      }),
    ).toStrictEqual('addressLine1');
  });
  test('should return only addressLine2 if there are no other fields', () => {
    expect(
      addressFormat({
        addressLine1: '',
        addressLine2: 'addressLine2',
        city: '',
        state: '',
        zip: '',
        region: Regions.US,
      }),
    ).toStrictEqual('addressLine2');
  });
  test('should return only city if there are no other fields', () => {
    expect(
      addressFormat({
        addressLine1: '',
        addressLine2: '',
        city: 'city',
        state: '',
        zip: '',
        region: Regions.US,
      }),
    ).toStrictEqual('city');
  });
  test('should return only state if there are no other fields', () => {
    expect(
      addressFormat({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: 'state',
        zip: '',
        region: Regions.US,
      }),
    ).toStrictEqual('state');
  });
  test('should return only zip if there are no other fields', () => {
    expect(
      addressFormat({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: 'zip',
        region: Regions.US,
      }),
    ).toStrictEqual('zip');
  });
  test('should return only addressLine1 if there are no other fields', () => {
    expect(
      addressFormat({
        addressLine1: 'addressLine1',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        region: Regions.US,
      }),
    ).toStrictEqual('addressLine1');
  });
  test('should return full address separated by comma when all fields are specified', () => {
    expect(
      addressFormat({
        addressLine1: 'addressLine1',
        addressLine2: 'addressLine2',
        city: 'city',
        state: 'state',
        zip: 'zip',
        region: Regions.US,
      }),
    ).toStrictEqual('addressLine1, addressLine2, city, state, zip');
  });
});
