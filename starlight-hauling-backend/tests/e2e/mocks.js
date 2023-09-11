import * as allServicesMocks from './servicesMocks/index.js';
import * as billingServiceMocks from './servicesMocks/billing/index.js';
import * as authServiceMocks from './servicesMocks/auth/index.js';
import * as dispatcherServiceMocks from './servicesMocks/dispatcher/index.js';

export const mockAll = () => {
  Object.values(allServicesMocks).forEach(mockedCall => {
    mockedCall().persist();
  });
};
export const mockBilling = () => {
  Object.values(billingServiceMocks).forEach(mockedCall => {
    mockedCall().persist();
  });
};
export const mockAuth = () => {
  Object.values(authServiceMocks).forEach(mockedCall => {
    mockedCall().persist();
  });
};
export const mockDispatcher = () => {
  Object.values(dispatcherServiceMocks).forEach(mockedCall => {
    mockedCall().persist();
  });
};
// you can customize mocks by adding new intercepted API invocations below
// just use names of imported interceptors and pass custom args:(
//     {
//         input, // optional, can use defaults but better to re-define per case
//         output, // optional, can use defaults but better to re-define per case
//         status, // optional, can use defaults but better to re-define per case
//         outputCallback?: (uri, body) => output, // optional, to return output based on other params
//         statusCallback?: (uri, body) => status, // optional, to return status based on other params
//     },
//     baseUrl, // optional, I don't see any reason to re-write defaults for it
// )
