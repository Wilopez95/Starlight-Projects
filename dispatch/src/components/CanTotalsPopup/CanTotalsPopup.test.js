// Libs
// import React from 'react';
// import { mount } from 'enzyme';
import { countCansBySize } from './CanTotalsPopup';

const testCans = [
  {
    name: '1',
    id: '1',
    size: '10',
    requiresMaintenance: 0,
    outOfService: 0,
  },
  {
    name: '2',
    id: '2',
    size: '10',
    requiresMaintenance: 1,
    outOfService: 0,
  },
  {
    name: '3',
    id: '3',
    size: '10',
    requiresMaintenance: 0,
    outOfService: 1,
  },
];

describe('<CanTotalsPopup />', () => {
  it('countCansBySize -- should return the total, available and size', () => {
    const canCount = countCansBySize(testCans)[0];
    expect(canCount.size).toBe('10');
    expect(canCount.total).toEqual(3);
    expect(canCount.available).toEqual(1);
  });
});
