import knexMock from '../../db/connection.js';
import customerRepoMock from '../../repos/customer.js';
import linkedCustomerRepoMock from '../../repos/linkedCustomers.js';
import { createCustomer } from './createCustomer.js';
import { handleLinkedCustomers as handleLinkedCustomersMock } from './utils/handleLinkedCustomers.js';

jest.mock('../../db/connection.js');
jest.mock('../../repos/customer.js');
jest.mock('../../repos/linkedCustomers.js');
jest.mock('../../repos/termsAndConditions.js');
jest.mock('../../repos/driver.js');
jest.mock('./utils/handleLinkedCustomers.js');
jest.mock('../../utils/unitsConvertor.js');

const ctxMock = {
  state: {
    user: {},
  },
};

describe('createCustomer', () => {
  const fakeOptions = { body: { commercial: true }, tenantId: 1 };
  const commercialFields = { mainFirstName: 'mainFirstName', mainLastName: 'mainLastName' };
  const nonCommercialFields = { firstName: 'firstName', lastName: 'lastName' };
  const fakeCreatedCustomer = { id: 1 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get CustomerRepo instance properly', async () => {
    customerRepoMock.createOne.mockResolvedValueOnce(fakeCreatedCustomer);

    await createCustomer(ctxMock, fakeOptions);

    expect(customerRepoMock.getInstance).toHaveBeenCalledWith(ctxMock.state);
  });

  it('should open transaction', async () => {
    customerRepoMock.createOne.mockResolvedValueOnce(fakeCreatedCustomer);

    await createCustomer(ctxMock, { body: { commercial: true } });

    expect(knexMock.transaction).toHaveBeenCalledTimes(1);
  });

  it('should call rollback in error case', async () => {
    const fakeError = new Error('error');
    let expectedError = null;
    customerRepoMock.createOne.mockRejectedValueOnce(fakeError);

    try {
      await createCustomer(ctxMock, fakeOptions);
    } catch (error) {
      expectedError = error;
    }

    expect(knexMock.rollback).toHaveBeenCalledTimes(1);
    expect(expectedError).toBe(fakeError);
  });

  it('should call commit in success case', async () => {
    customerRepoMock.createOne.mockResolvedValueOnce(fakeCreatedCustomer);

    const result = await createCustomer(ctxMock, fakeOptions);

    expect(knexMock.commit).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(fakeCreatedCustomer);
  });

  it('should call "createOne" with commercial fields', async () => {
    const localFakeOptions = {
      tenantId: 1,
      body: {
        commercial: true,
        ...commercialFields,
        ...nonCommercialFields,
      },
    };

    const expectedParams = {
      data: commercialFields,
      commercial: true,
      tenantId: localFakeOptions.tenantId,
      log: true,
    };
    customerRepoMock.createOne.mockResolvedValueOnce(fakeCreatedCustomer);

    await createCustomer(ctxMock, localFakeOptions);

    expect(customerRepoMock.createOne).toHaveBeenCalledWith(expectedParams, knexMock.transaction());
    expect(knexMock.commit).toHaveBeenCalledTimes(1);
  });

  it('should call "createOne" with non commercial fields', async () => {
    const localFakeOptions = {
      tenantId: 1,
      body: {
        commercial: false,
        ...commercialFields,
        ...nonCommercialFields,
      },
    };

    const expectedParams = {
      data: nonCommercialFields,
      commercial: false,
      tenantId: localFakeOptions.tenantId,
      log: true,
    };
    customerRepoMock.createOne.mockResolvedValueOnce(fakeCreatedCustomer);

    await createCustomer(ctxMock, localFakeOptions);

    expect(customerRepoMock.createOne).toHaveBeenCalledWith(expectedParams, knexMock.transaction());
    expect(knexMock.commit).toHaveBeenCalledTimes(1);
  });

  it('should add "gradingNotification = true" to update options if input data has truthy "gradingRequired" property', async () => {
    const localFakeOptions = {
      tenantId: 1,
      body: {
        commercial: false,
        gradingRequired: true,
        ...commercialFields,
        ...nonCommercialFields,
      },
    };

    const expectedParams = {
      data: {
        gradingRequired: localFakeOptions.body.gradingRequired,
        gradingNotification: true,
        ...nonCommercialFields,
      },
      commercial: localFakeOptions.body.commercial,
      tenantId: localFakeOptions.tenantId,
      log: true,
    };

    customerRepoMock.createOne.mockResolvedValueOnce(fakeCreatedCustomer);

    await createCustomer(ctxMock, localFakeOptions);

    expect(customerRepoMock.createOne).toHaveBeenCalledWith(expectedParams, knexMock.transaction());
  });

  it('should get LinkedCustomersRepo instance properly', async () => {
    customerRepoMock.createOne.mockResolvedValueOnce(fakeCreatedCustomer);

    await createCustomer(ctxMock, fakeOptions);

    expect(linkedCustomerRepoMock.getInstance).toHaveBeenCalledWith(ctxMock.state);
  });

  it('should call handle linked customers properly', async () => {
    customerRepoMock.createOne.mockResolvedValueOnce(fakeCreatedCustomer);

    await createCustomer(ctxMock, fakeOptions);

    expect(handleLinkedCustomersMock).toHaveBeenCalledWith(
      {
        repo: linkedCustomerRepoMock,
        linkedCustomerIds: fakeOptions.body.linkedCustomerIds,
        customerId: fakeCreatedCustomer.id,
      },
      knexMock.transaction(),
    );
  });
});
