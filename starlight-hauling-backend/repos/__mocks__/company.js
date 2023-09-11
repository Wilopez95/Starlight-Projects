const companyRepoMock = {
  getInstance: jest.fn().mockReturnThis(),
  getWithTenant: jest.fn(),
};

export default companyRepoMock;
