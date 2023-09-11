export const loggerMock = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

export const fakeСtx = {
  state: { user: {} },
  logger: loggerMock,
};
