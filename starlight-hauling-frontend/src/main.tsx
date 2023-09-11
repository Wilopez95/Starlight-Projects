/* eslint-disable import/no-import-module-exports */
import 'core-js/stable';
import 'mobx-react-lite/batchingForReactDom';
import React from 'react';
import { render } from 'react-dom';
import ReactModal from 'react-modal';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

import { configure } from 'mobx';
import { pdfjs } from 'react-pdf';

import { App } from '@root/app';

import pkg from '../package.json';

import { isCore } from './consts/env';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const sentryEnv = process.env.SENTRY_ENV;
const dsn = process.env.SENTRY_DSN;
const packageVersion = pkg.version ?? 'unknown';

configure({ enforceActions: 'always' });
if (dsn) {
  Sentry.init({
    dsn,
    release: `hauling-frontend@${packageVersion}`,
    environment: sentryEnv,
    tracesSampleRate: sentryEnv !== 'production' ? (sentryEnv === 'staging' ? 0.05 : 0) : 0.1,
    integrations: [new BrowserTracing()],
  });

  Sentry.setTag('is_core', isCore);
  Sentry.setTag('sentry_env', sentryEnv);
}

const appElement = document.getElementById('app')!;

const init = () => {
  ReactModal.setAppElement(appElement);
  render(<App />, appElement);
};

init();

if (module.hot) {
  module.hot.accept();
}
