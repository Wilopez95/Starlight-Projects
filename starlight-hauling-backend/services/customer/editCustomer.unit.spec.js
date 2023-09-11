import knexMock from '../../db/connection.js';
import customerRepoMock from '../../repos/customer.js';
import linkedCustomerRepoMock from '../../repos/linkedCustomers.js';
import { editCustomer } from './editCustomer.js';
import { handleLinkedCustomers as handleLinkedCustomersMock } from './utils/handleLinkedCustomers.js';
jest.mock('../../db/connection.js');
jest.mock('../../repos/customer.js');
jest.mock('../../repos/linkedCustomers.js');
jest.mock('../../repos/termsAndConditions.js');
jest.mock('../../repos/driver.js');
jest.mock('./utils/handleLinkedCustomers.js');
jest.mock('../../utils/unitsConvertor.js');

const ctxMock = {
  concurrentData: true,
  state: {
    user: {},
  },
};

describe('editCustomer', () => {
  const fakeOptions = { body: { commercial: true, linkedCustomerIds: [1, 2] }, tenantId: 1, id: 1 };
  const commercialFields = { mainFirstName: 'mainFirstName', mainLastName: 'mainLastName' };
  const nonCommercialFields = { firstName: 'firstName', lastName: 'lastName' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get CustomerRepo instance properly', async () => {
    await editCustomer(ctxMock, fakeOptions);

    expect(customerRepoMock.getInstance).toHaveBeenCalledWith(ctxMock.state);
  });

  it('should open transaction', async () => {
    await editCustomer(ctxMock, { body: { commercial: true } });

    expect(knexMock.transaction).toHaveBeenCalledTimes(1);
  });

  it('should call rollback in error case', async () => {
    const fakeError = new Error('error');
    let expectedError = null;
    customerRepoMock.updateOne.mockRejectedValueOnce(fakeError);

    try {
      await editCustomer(ctxMock, fakeOptions);
    } catch (error) {
      expectedError = error;
    }

    expect(knexMock.rollback).toHaveBeenCalledTimes(1);
    expect(expectedError).toBe(fakeError);
  });

  it('should call commit in success case', async () => {
    const expectedResult = { id: 1 };
    customerRepoMock.updateOne.mockResolvedValueOnce(expectedResult);

    const result = await editCustomer(ctxMock, fakeOptions);

    expect(knexMock.commit).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(expectedResult);
  });

  it('should call "updateOne" with commercial fields', async () => {
    const localFakeOptions = {
      tenantId: 1,
      id: 1,
      body: {
        contactId: 1,
        commercial: true,
        ...commercialFields,
        ...nonCommercialFields,
      },
    };

    const expectedParams = {
      condition: { id: localFakeOptions.id },
      data: { contactId: localFakeOptions.body.contactId, ...commercialFields },
      commercial: localFakeOptions.body.commercial,
      concurrentData: ctxMock.concurrentData,
      tenantId: localFakeOptions.tenantId,
      log: true,
    };

    await editCustomer(ctxMock, localFakeOptions);

    expect(customerRepoMock.updateOne).toHaveBeenCalledWith(expectedParams, knexMock.transaction());
    expect(knexMock.commit).toHaveBeenCalledTimes(1);
  });

  it('should call "updateOne" with non commercial fields', async () => {
    const localFakeOptions = {
      tenantId: 1,
      id: 1,
      body: {
        contactId: 1,
        commercial: false,
        ...commercialFields,
        ...nonCommercialFields,
      },
    };

    const expectedParams = {
      condition: { id: localFakeOptions.id },
      data: { contactId: localFakeOptions.body.contactId, ...nonCommercialFields },
      commercial: localFakeOptions.body.commercial,
      concurrentData: ctxMock.concurrentData,
      tenantId: localFakeOptions.tenantId,
      log: true,
    };

    await editCustomer(ctxMock, localFakeOptions);

    expect(customerRepoMock.updateOne).toHaveBeenCalledWith(expectedParams, knexMock.transaction());
    expect(knexMock.commit).toHaveBeenCalledTimes(1);
  });

  it('should add "gradingNotification = true" to update options if input data has truthy "gradingRequired" property', async () => {
    const localFakeOptions = {
      tenantId: 1,
      id: 1,
      body: {
        gradingRequired: true,
        contactId: 1,
        commercial: false,
        ...commercialFields,
        ...nonCommercialFields,
      },
    };

    const expectedParams = {
      condition: { id: localFakeOptions.id },
      data: {
        contactId: localFakeOptions.body.contactId,
        gradingRequired: localFakeOptions.body.gradingRequired,
        gradingNotification: true,
        ...nonCommercialFields,
      },
      commercial: localFakeOptions.body.commercial,
      concurrentData: ctxMock.concurrentData,
      tenantId: localFakeOptions.tenantId,
      log: true,
    };

    await editCustomer(ctxMock, localFakeOptions);

    expect(customerRepoMock.updateOne).toHaveBeenCalledWith(expectedParams, knexMock.transaction());
  });

  it('should get LinkedCustomersRepo instance properly', async () => {
    await editCustomer(ctxMock, fakeOptions);

    expect(linkedCustomerRepoMock.getInstance).toHaveBeenCalledWith(ctxMock.state);
  });

  it('should call handle linked customers properly', async () => {
    await editCustomer(ctxMock, fakeOptions);

    expect(handleLinkedCustomersMock).toHaveBeenCalledWith(
      {
        repo: linkedCustomerRepoMock,
        linkedCustomerIds: fakeOptions.body.linkedCustomerIds,
        customerId: fakeOptions.id,
      },
      knexMock.transaction(),
    );
  });
});
