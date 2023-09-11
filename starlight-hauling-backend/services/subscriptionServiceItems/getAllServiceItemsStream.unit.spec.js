import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';
import { getAllServiceItemsStream } from './getAllServiceItemsStream.js';
import { getTransformRawServiceItemsStream } from './utils/transformRawServiceItemsStream.js';

jest.mock('../../repos/subscriptionServiceItem/subscriptionServiceItem.js');
jest.mock('./utils/transformRawServiceItemsStream.js');

const ctxMock = {
  state: {},
  logger: {
    error: jest.fn(),
  },
};

describe('getAllServiceItemsStream', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getAllStream with provided options', () => {
    const fakeOptions = {};

    getAllServiceItemsStream(ctxMock, fakeOptions);

    expect(SubscriptionServiceItemRepo.getInstance).toHaveBeenCalledWith(ctxMock.state);
    expect(SubscriptionServiceItemRepo.getAllStream).toHaveBeenCalledWith(fakeOptions);
  });

  // it('should subscribe on stream error event', () => {
  //   const fakeOptions = {};

  //   getAllServiceItemsStream(ctxMock, fakeOptions);

  //   expect(SubscriptionServiceItemRepo.once).toHaveBeenCalledWith('error', expect.any(Function));
  // });

  // it('should subscribe on stream close event', () => {
  //   const fakeOptions = {};

  //   getAllServiceItemsStream(ctxMock, fakeOptions);

  //   expect(SubscriptionServiceItemRepo.once).toHaveBeenCalledWith('close', expect.any(Function));
  // });

  // it('should pipe returned stream into TransformRawServiceItemsStream stream', () => {
  //   const fakeOptions = {};

  //   getAllServiceItemsStream(ctxMock, fakeOptions);

  //   expect(SubscriptionServiceItemRepo.pipe).toHaveBeenCalledWith(
  //     getTransformRawServiceItemsStream(),
  //   );
  // });
});
