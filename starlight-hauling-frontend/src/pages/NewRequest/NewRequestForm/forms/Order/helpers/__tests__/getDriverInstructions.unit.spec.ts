import { getDriverInstructionsTemplate } from '../getDriverInstructions';

type CustomerI = {
  workOrderNote?: string;
};

describe('getDriverInstructions', () => {
  test('With selectedCustomer without work order notes', () => {
    const customer: CustomerI = {};

    const template = getDriverInstructionsTemplate(customer);

    expect(template).toEqual('');
  });

  test('With selectedCustomer with work order notes without jobsite pair', () => {
    const customer: CustomerI = { workOrderNote: 'some-work-order-note' };

    const template = getDriverInstructionsTemplate(customer);

    const expected = `[${customer.workOrderNote ?? ''}]`;

    expect(template).toEqual(expected);
  });

  test('With selectedCustomer with work order notes with jobsite pair', () => {
    const customer: CustomerI = { workOrderNote: 'some-work-order-note' };
    const jobSiteWorkOrder = 'jobsite-work-order';

    const template = getDriverInstructionsTemplate(customer, { workOrderNotes: jobSiteWorkOrder });

    const expected = `[${customer.workOrderNote ?? ''}] [${jobSiteWorkOrder}]`;

    expect(template).toEqual(expected);
  });

  test('With selectedCustomer withouth work order notes with jobsite pair', () => {
    const customer: CustomerI = {};
    const jobSiteWorkOrder = 'jobsite-work-order';

    const template = getDriverInstructionsTemplate(customer, { workOrderNotes: jobSiteWorkOrder });

    const expected = ` [${jobSiteWorkOrder}]`;

    expect(template).toEqual(expected);
  });
});
