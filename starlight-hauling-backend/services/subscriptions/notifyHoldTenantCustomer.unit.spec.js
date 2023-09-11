import cloneDeep from 'lodash/cloneDeep.js';
import * as email from '../email.js';
import { notifyHoldTenantCustomer } from './notifyHoldTenantCustomer.js';

const getInstance = methods => ({
  getInstance: () =>
    Object.entries(methods).reduce((acc, [method, value]) => {
      acc[method] = () => value;
      return acc;
    }, {}),
});

const ctx = {
  state: {},
  logger: {
    debug: () => null,
  },
};

let SubscriptionRepo;
let RecurrentOrderTemplateRepo;
let getMailingWithSales;
let common;

const baseCommon = {
  customerId: 12,
  firstName: 'John',
  lastName: 'Smith',
  email: 'john@smith.com',
  onHoldNotifySalesRep: true,
  onHoldNotifyMainContact: true,
  salesId: '123',
  contactId: 397,
};

const subscriptions = [
  {
    id: 2716,
    ...baseCommon,
  },
  {
    id: 2717,
    ...baseCommon,
  },
];
const orders = [
  {
    id: 34,
    ...baseCommon,
  },
  {
    id: 35,
    ...baseCommon,
  },
];

const salesReps = [{ id: '123', name: 'Kos Tya', email: 'test@starlightpro.com' }];
const mailSettings = {
  customerOnHoldFrom: 'test2',
  customerOnHoldSubject: 'Resume subscription(s)',
  customerOnHoldBody:
    'subscription(s) {{ subscriptionsIds }} and orders {{recurringOrdersIds}} holded by {{customerName}}',
  domainId: 1,
  domain: 'stark.starlightpro.net',
};

const generatingOnHoldCustomerEventBody = jest.spyOn(email, 'generatingOnHoldCustomerEventBody');
const sendTextEmail = jest.fn(() => Promise.resolve());

jest.mock('../../utils/unitsConvertor.js');

beforeEach(() => {
  SubscriptionRepo = getInstance({
    getSubscriptionsToNotifyHold: subscriptions,
    setSubscriptionHoldSent: true,
  });

  RecurrentOrderTemplateRepo = getInstance({
    getOrderToNotifyHold: orders,
    setOrderHoldSent: true,
  });

  getMailingWithSales = () => ({
    mailSettings,
    salesReps,
  });

  common = cloneDeep(baseCommon);
});

afterEach(() => {
  generatingOnHoldCustomerEventBody.mockClear();
  sendTextEmail.mockClear();
});

describe('notify customer on hold', () => {
  test('notify all', async () => {
    await notifyHoldTenantCustomer(ctx, 2, 'stark', {
      SubscriptionRepo,
      RecurrentOrderTemplateRepo,
      getMailingWithSales,
      generatingOnHoldCustomerEventBody: email.generatingOnHoldCustomerEventBody,
      sendTextEmail,
    });

    const bodyExpect = 'subscription(s) 2716,2717 and orders 34,35 holded by John Smith';

    expect(generatingOnHoldCustomerEventBody).toHaveBeenCalledTimes(2);
    expect(generatingOnHoldCustomerEventBody).toHaveLastReturnedWith(bodyExpect);
    expect(sendTextEmail).toHaveBeenCalledTimes(2);
    expect(sendTextEmail).toHaveBeenNthCalledWith(
      1,
      'john@smith.com',
      'Resume subscription(s)',
      bodyExpect,
      'test2@stark.starlightpro.net',
    );
    expect(sendTextEmail).toHaveBeenNthCalledWith(
      2,
      'test@starlightpro.com',
      'Resume subscription(s)',
      bodyExpect,
      'test2@stark.starlightpro.net',
    );
  });

  test('notify only subscriptions', async () => {
    RecurrentOrderTemplateRepo = getInstance({
      getOrderToNotifyHold: [],
    });
    await notifyHoldTenantCustomer(ctx, 2, 'stark', {
      SubscriptionRepo,
      RecurrentOrderTemplateRepo,
      getMailingWithSales,
      generatingOnHoldCustomerEventBody: email.generatingOnHoldCustomerEventBody,
      sendTextEmail,
    });

    const bodyExpect = 'subscription(s) 2716,2717 and orders  holded by John Smith';

    expect(generatingOnHoldCustomerEventBody).toHaveBeenCalledTimes(2);
    expect(generatingOnHoldCustomerEventBody).toHaveLastReturnedWith(bodyExpect);
    expect(sendTextEmail).toHaveBeenLastCalledWith(
      'test@starlightpro.com',
      'Resume subscription(s)',
      bodyExpect,
      'test2@stark.starlightpro.net',
    );
  });

  test('notify only mainContact', async () => {
    RecurrentOrderTemplateRepo = getInstance({
      getOrderToNotifyHold: [
        { id: 12, ...common, customerId: 1, onHoldNotifySalesRep: false },
        {
          id: 13,
          ...common,
          customerId: 2,
          firstName: 'dev',
          email: 'dev@mail',
          onHoldNotifySalesRep: false,
        },
      ],
      setOrderHoldSent: true,
    });
    SubscriptionRepo = getInstance({
      getSubscriptionsToNotifyHold: [
        { id: 225, ...common, customerId: 1, onHoldNotifySalesRep: false },
      ],
      setSubscriptionHoldSent: true,
    });
    await notifyHoldTenantCustomer(ctx, 2, 'stark', {
      SubscriptionRepo,
      RecurrentOrderTemplateRepo,
      getMailingWithSales,
      generatingOnHoldCustomerEventBody: email.generatingOnHoldCustomerEventBody,
      sendTextEmail,
    });

    const bodyExpect1 = 'subscription(s) 225 and orders 12 holded by John Smith';
    const bodyExpect2 = 'subscription(s)  and orders 13 holded by dev Smith';

    expect(generatingOnHoldCustomerEventBody).toHaveBeenCalledTimes(2);
    expect(generatingOnHoldCustomerEventBody).toHaveNthReturnedWith(1, bodyExpect1);
    expect(generatingOnHoldCustomerEventBody).toHaveNthReturnedWith(2, bodyExpect2);
    expect(sendTextEmail).toHaveBeenNthCalledWith(
      1,
      'john@smith.com',
      'Resume subscription(s)',
      bodyExpect1,
      'test2@stark.starlightpro.net',
    );
    expect(sendTextEmail).toHaveBeenNthCalledWith(
      2,
      'john@smith.com',
      'Resume subscription(s)',
      bodyExpect2,
      'test2@stark.starlightpro.net',
    );
  });

  test('no one notify', async () => {
    RecurrentOrderTemplateRepo = getInstance({
      getOrderToNotifyHold: [],
    });
    SubscriptionRepo = getInstance({
      getSubscriptionsToNotifyHold: [],
    });
    await notifyHoldTenantCustomer(ctx, 2, 'stark', {
      SubscriptionRepo,
      RecurrentOrderTemplateRepo,
      getMailingWithSales,
      generatingOnHoldCustomerEventBody: email.generatingOnHoldCustomerEventBody,
      sendTextEmail,
    });

    expect(generatingOnHoldCustomerEventBody).toHaveBeenCalledTimes(0);
    expect(sendTextEmail).toHaveBeenCalledTimes(0);
  });
});
