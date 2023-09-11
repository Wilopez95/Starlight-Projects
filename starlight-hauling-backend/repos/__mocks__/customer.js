const customerRepoMock = {
  getInstance: jest.fn().mockReturnThis(),
  createOne: jest.fn(),
  updateOne: jest.fn(),
};

export default customerRepoMock;
