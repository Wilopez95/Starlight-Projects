import cloneDeep from 'lodash/cloneDeep.js';

import { templateMap } from './templateMap.js';

const ctx = {
  logger: {
    // eslint-disable-next-line no-empty-function
    debug() {},
  },
};

const baseInput = {
  billableServiceId: 12,
  subscriptionId: 2645,
  subscriptionServiceItemId: 5950,
  startDate: new Date('2021-09-01T00:00:00.000Z'),
  endDate: null,
  frequencyType: 'everyXDays',
  frequencyOccurrences: 6,
  serviceDaysOfWeek: {},
  deliveryDate: new Date('2021-09-23T00:00:00.000Z'),
  finalDate: null,
};
const today = new Date('2021-09-24T00:00:00.000Z');

let template = {};

beforeEach(() => {
  template = cloneDeep(baseInput);
});

describe('defineServicingDays', () => {
  test('every 1 days start of month', () => {
    template.frequencyOccurrences = 4;
    const result = templateMap(ctx, { templates: [template], today });

    expect(result).toMatchInlineSnapshot(`
      Object {
        "serviceItemMap": Object {
          "5950": Object {
            "billableServiceId": 12,
            "servicingDaysRoutes": Object {},
            "subscriptionId": 2645,
            "subscriptionServiceItemId": 5950,
          },
        },
        "subOrders": Array [
          Object {
            "billableServiceId": 12,
            "serviceDate": "2021-09-23 18:00:00",
            "serviceDayOfWeekRequiredByCustomer": undefined,
            "subscriptionId": 2645,
            "subscriptionServiceItemId": 5950,
          },
          Object {
            "billableServiceId": 12,
            "serviceDate": "2021-09-27 18:00:00",
            "serviceDayOfWeekRequiredByCustomer": undefined,
            "subscriptionId": 2645,
            "subscriptionServiceItemId": 5950,
          },
          Object {
            "billableServiceId": 12,
            "serviceDate": "2021-10-01 18:00:00",
            "serviceDayOfWeekRequiredByCustomer": undefined,
            "subscriptionId": 2645,
            "subscriptionServiceItemId": 5950,
          },
          Object {
            "billableServiceId": 12,
            "serviceDate": "2021-10-05 18:00:00",
            "serviceDayOfWeekRequiredByCustomer": undefined,
            "subscriptionId": 2645,
            "subscriptionServiceItemId": 5950,
          },
          Object {
            "billableServiceId": 12,
            "serviceDate": "2021-10-09 18:00:00",
            "serviceDayOfWeekRequiredByCustomer": undefined,
            "subscriptionId": 2645,
            "subscriptionServiceItemId": 5950,
          },
          Object {
            "billableServiceId": 12,
            "serviceDate": "2021-10-13 18:00:00",
            "serviceDayOfWeekRequiredByCustomer": undefined,
            "subscriptionId": 2645,
            "subscriptionServiceItemId": 5950,
          },
          Object {
            "billableServiceId": 12,
            "serviceDate": "2021-10-17 18:00:00",
            "serviceDayOfWeekRequiredByCustomer": undefined,
            "subscriptionId": 2645,
            "subscriptionServiceItemId": 5950,
          },
          Object {
            "billableServiceId": 12,
            "serviceDate": "2021-10-21 18:00:00",
            "serviceDayOfWeekRequiredByCustomer": undefined,
            "subscriptionId": 2645,
            "subscriptionServiceItemId": 5950,
          },
        ],
      }
    `);
  });

  test('every 6 days start more than month ago', () => {
    template.startDate = new Date('2021-05-18T00:00:00.000Z');
    const { subOrders } = templateMap(ctx, { templates: [template], today });

    expect(subOrders).toMatchInlineSnapshot(`
      Array [
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-09-23 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-09-29 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-05 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-11 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-17 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-23 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
      ]
    `);
  });

  test('every 6 days in future', () => {
    template.startDate = new Date('2021-10-25T00:00:00.000Z');
    const { subOrders } = templateMap(ctx, { templates: [template], today });

    expect(subOrders).toMatchInlineSnapshot(`
      Array [
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-24 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-30 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-11-05 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-11-11 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-11-17 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-11-23 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
      ]
    `);
  });

  test('1 per week from start month', () => {
    template.startDate = new Date('2021-09-01T00:00:00.000Z');
    template.frequencyOccurrences = 1;
    template.frequencyType = 'xPerWeek';
    template.serviceDaysOfWeek = { 0: 'monday', 1: '' };
    const { subOrders } = templateMap(ctx, { templates: [template], today });

    expect(subOrders).toMatchInlineSnapshot(`
      Array [
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-09-27 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-09-28 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-04 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-05 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-11 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-12 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-18 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-19 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
      ]
    `);
  });

  test('2 per week from next month', () => {
    template.startDate = new Date('2021-10-01T00:00:00.000Z');
    template.frequencyOccurrences = 2;
    template.finalDate = new Date('2021-10-07T00:00:00.000Z');
    template.frequencyType = 'xPerWeek';
    template.serviceDaysOfWeek = { 0: 'monday', 6: 'sunday' };
    const { subOrders } = templateMap(ctx, { templates: [template], today });

    expect(subOrders).toMatchInlineSnapshot(`
      Array [
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-03 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-04 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
      ]
    `);
  });

  test('2 per week from this month', () => {
    template.startDate = new Date('2021-09-10T00:00:00.000Z');
    template.frequencyOccurrences = 2;
    template.finalDate = new Date('2021-10-07T00:00:00.000Z');
    template.frequencyType = 'xPerWeek';
    template.serviceDaysOfWeek = { 0: 'monday', 6: 'sunday' };
    const { subOrders } = templateMap(ctx, { templates: [template], today });

    expect(subOrders).toMatchInlineSnapshot(`
      Array [
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-09-26 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-09-27 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-03 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-04 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
      ]
    `);
  });

  test('2 per week in past', () => {
    template.startDate = new Date('2021-08-12T00:00:00.000Z');
    template.frequencyOccurrences = 2;
    template.frequencyType = 'xPerWeek';
    template.serviceDaysOfWeek = { 0: 'monday', 1: '' };
    const { subOrders } = templateMap(ctx, { templates: [template], today });

    expect(subOrders).toMatchInlineSnapshot(`
      Array [
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-09-27 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-09-28 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-04 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-05 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-11 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-12 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-18 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-19 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
      ]
    `);
  });

  test('1 per week in future', () => {
    template.startDate = new Date('2021-12-12T00:00:00.000Z');
    template.frequencyOccurrences = 1;
    template.frequencyType = 'xPerWeek';
    template.serviceDaysOfWeek = { 0: 'monday' };
    const { subOrders } = templateMap(ctx, { templates: [template], today });

    expect(subOrders).toMatchInlineSnapshot(`
      Array [
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-12-13 17:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-12-20 17:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-12-27 17:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2022-01-03 17:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2022-01-10 17:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
      ]
    `);
  });

  test('1 per month in past no day match', () => {
    template.startDate = new Date('2021-08-26T00:00:00.000Z');
    template.frequencyOccurrences = 1;
    template.frequencyType = 'xPerMonth';
    template.serviceDaysOfWeek = { 0: '' };
    const { subOrders } = templateMap(ctx, { templates: [template], today });

    expect(subOrders).toMatchInlineSnapshot(`
      Array [
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-09-27 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
      ]
    `);
  });

  test('1 per month from next wednesday', () => {
    template.startDate = new Date('2021-09-25T00:00:00.000Z');
    template.frequencyOccurrences = 1;
    template.frequencyType = 'xPerMonth';
    template.serviceDaysOfWeek = { 3: '' };
    const { subOrders } = templateMap(ctx, { templates: [template], today });

    expect(subOrders).toMatchInlineSnapshot(`
      Array [
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-09-30 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
      ]
    `);
  });

  test('1 per month in past', () => {
    template.startDate = new Date('2021-06-15T00:00:00.000Z');
    template.frequencyOccurrences = 1;
    template.frequencyType = 'xPerMonth';
    template.serviceDaysOfWeek = { 2: '' };
    const { subOrders } = templateMap(ctx, { templates: [template], today });

    expect(subOrders).toMatchInlineSnapshot(`
      Array [
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-09-29 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
      ]
    `);
  });

  test('1 per month in past no day match', () => {
    template.startDate = new Date('2021-08-26T00:00:00.000Z');
    template.frequencyOccurrences = 1;
    template.frequencyType = 'xPerMonth';
    template.serviceDaysOfWeek = { 0: '' };
    const { subOrders } = templateMap(ctx, { templates: [template], today });

    expect(subOrders).toMatchInlineSnapshot(`
      Array [
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-09-27 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
      ]
    `);
  });

  test('1 per week delivery final', () => {
    template.startDate = new Date('2021-08-18T00:00:00.000Z');
    template.deliveryDate = new Date('2021-10-15T00:00:00.000Z');
    template.finalDate = new Date('2021-11-01T00:00:00.000Z');
    template.frequencyOccurrences = 1;
    template.frequencyType = 'xPerWeek';
    template.serviceDaysOfWeek = { 0: 'monday', 1: '' };
    const { subOrders } = templateMap(ctx, { templates: [template], today });

    expect(subOrders).toMatchInlineSnapshot(`
      Array [
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-18 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-19 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-25 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
        Object {
          "billableServiceId": 12,
          "serviceDate": "2021-10-26 18:00:00",
          "serviceDayOfWeekRequiredByCustomer": undefined,
          "subscriptionId": 2645,
          "subscriptionServiceItemId": 5950,
        },
      ]
    `);
  });
});
