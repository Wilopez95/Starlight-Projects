const serviceItemRepoMock = {
  getInstance: jest.fn().mockReturnThis(),
  getAllStream: jest.fn().mockReturnThis(),
  once: jest.fn(),
  push: jest.fn(),
  pipe: jest.fn(),
};

export default serviceItemRepoMock;
