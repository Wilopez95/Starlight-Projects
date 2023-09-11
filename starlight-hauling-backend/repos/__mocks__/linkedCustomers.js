const linkedCustomersRepoMock = {
  getInstance: jest.fn().mockReturnThis(),
  getLinkedCustomers: jest.fn(),
  deleteRelatedDataByCustomerId: jest.fn(),
  linkCustomers: jest.fn(),
};

export default linkedCustomersRepoMock;
