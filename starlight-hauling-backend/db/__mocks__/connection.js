const knexMock = {
  raw: jest.fn().mockReturnThis(),
  transaction: jest.fn().mockReturnThis(),
  commit: jest.fn().mockReturnThis(),
  rollback: jest.fn().mockReturnThis(),
};

export default knexMock;
