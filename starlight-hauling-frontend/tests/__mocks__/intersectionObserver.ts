const intersectionObserverMock = () => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
});

global.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock);
