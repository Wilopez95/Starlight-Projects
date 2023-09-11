import 'mobx-react-lite/batchingForReactDom';

import React from 'react';
import { render } from 'react-dom';
import ReactModal from 'react-modal';
import * as Sentry from '@sentry/react/dist/index';
import { configure } from 'mobx';

import { App } from '@root/app';

import pkg from '../package.json';

const sentryEnv = process.env.SENTRY_ENV;
const dsn = process.env.SENTRY_DSN;
const packageVersion = pkg.version ? pkg.version : 'unknown';

configure({ enforceActions: 'always' });

if (dsn) {
  Sentry.init({
    dsn,
    release: `route-planner-frontend@${packageVersion}`,
    environment: sentryEnv,
  });

  Sentry.setTag('sentry_env', sentryEnv);
}

const appElement = document.getElementById('app');

if (appElement !== null) {
  const init = () => {
    ReactModal.setAppElement(appElement);
    render(<App />, appElement);
  };
  init();
}

// if (module.hot) {
//   module.hot.accept();
// }
