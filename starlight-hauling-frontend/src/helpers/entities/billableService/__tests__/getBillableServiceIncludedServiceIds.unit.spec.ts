import { getBillableServiceMock } from '@tests/__mocks__';

import { getBillableServiceIncludedServiceIds } from '../getBillableServiceIncludedServiceIds';

describe('getBillableServiceIncludedServiceIds', () => {
  test('should return empty list when service has no included services', () => {
    const result = getBillableServiceIncludedServiceIds({
      ...getBillableServiceMock(),
      services: [],
    });

    expect(result).toEqual([]);
  });

  test('should return service ids when service has included service ids', () => {
    const result = getBillableServiceIncludedServiceIds({
      ...getBillableServiceMock(),
      services: [1, 2, 3],
    });

    expect(result).toEqual([1, 2, 3]);
  });

  test('should return service ids when service has included services', () => {
    const result = getBillableServiceIncludedServiceIds({
      ...getBillableServiceMock(),
      services: [
        {
          ...getBillableServiceMock(),
          id: 1,
        },
        {
          ...getBillableServiceMock(),
          id: 2,
        },
        {
          ...getBillableServiceMock(),
          id: 3,
        },
      ],
    });

    expect(result).toEqual([1, 2, 3]);
  });
});
