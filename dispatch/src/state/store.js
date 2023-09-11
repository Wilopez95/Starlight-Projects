import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
// import { createLogger } from 'redux-logger';
import createReducer from '@root/state/reducers';
import { SENTRY_DSN } from '@root/helpers/config';
import { normalizrMiddleware } from '@root/state/middleware/normalizrMiddleware';

// const loggerMiddleware = createLogger({
//   level: 'info',
//   collapsed: true,
// });

// see https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/redux/
const sentryReduxEnhancer = Sentry.createReduxEnhancer();

Sentry.init({
  dsn: SENTRY_DSN,
  maxBreadcrumbs: 50,
  environment: process.env.NODE_ENV,
  release: `dispatch@${process.env.npm_package_version}`,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  integrations: [new BrowserTracing()],
  ignoreErrors: [
    'Network Error',
    'timeout of 60000ms exceeded',
    'timeout of 0ms exceeded',
    'TypeError',
    'addImage',
    'Failed to initialize WebGL.',
    'offsetWidth',
    'setData',
    'Request failed with status code 502',
    'Request failed with status code 401',
  ],
});

function configureStore(initialState = {}, history) {
  const middlewares = [thunk, normalizrMiddleware()];
  if (process.env.NODE_ENV === 'development') {
    // middlewares.push(loggerMiddleware);
  }
  const composeEnhancers =
    (process.env.NODE_ENV === 'development' &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        shouldHotReload: false,
      })) ||
    compose;

  const store = createStore(
    createReducer(history),
    initialState,
    composeEnhancers(applyMiddleware(...middlewares), sentryReduxEnhancer),
  );

  store.injectedReducers = {};

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducers', () => {
      store.replaceReducer(createReducer(store.injectedReducers));
    });
  }
  return store;
}

export default configureStore;
