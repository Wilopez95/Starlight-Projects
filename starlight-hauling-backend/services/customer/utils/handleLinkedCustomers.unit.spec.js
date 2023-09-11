import { handleLinkedCustomers } from './handleLinkedCustomers.js';

describe('handleLinkedCustomers', () => {
  const repoMock = { deleteRelatedDataByCustomerId: jest.fn(), linkCustomers: jest.fn() };
  const trxMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if linkedCustomerIds is not provided', async () => {
    const result = await handleLinkedCustomers({ repo: repoMock }, trxMock);

    expect(result).toBeNull();
    expect(repoMock.deleteRelatedDataByCustomerId).not.toHaveBeenCalled();
    expect(repoMock.linkCustomers).not.toHaveBeenCalled();
  });

  it('should delete existing customers and link new customers when linkedCustomerIds provided', async () => {
    const fakeLinkedCustomerIds = [1, 2, 3];
    const fakeCustomerId = 1;

    await handleLinkedCustomers(
      { repo: repoMock, linkedCustomerIds: fakeLinkedCustomerIds, customerId: fakeCustomerId },
      trxMock,
    );

    expect(repoMock.deleteRelatedDataByCustomerId).toHaveBeenCalledWith(fakeCustomerId, trxMock);
    expect(repoMock.linkCustomers).toHaveBeenCalledWith(
      { customerId: fakeCustomerId, linkedCustomerIds: fakeLinkedCustomerIds },
      trxMock,
    );
  });

  it('should delete existing customers when linkedCustomerIds provided (not falsy)', async () => {
    const fakeLinkedCustomerIds = [];
    const fakeCustomerId = 1;

    await handleLinkedCustomers(
      { repo: repoMock, linkedCustomerIds: fakeLinkedCustomerIds, customerId: fakeCustomerId },
      trxMock,
    );

    expect(repoMock.deleteRelatedDataByCustomerId).toHaveBeenCalledWith(fakeCustomerId, trxMock);
    expect(repoMock.linkCustomers).not.toHaveBeenCalled();
  });
});
