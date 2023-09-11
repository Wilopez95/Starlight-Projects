import 'mobx-react-lite/batchingForReactDom';

import React from 'react';
import { render } from 'react-dom';
import ReactModal from 'react-modal';
import { configure } from 'mobx';

import { App } from '@root/app/app';

configure({ enforceActions: 'always' });

const appElement = document.getElementById('app')!;

const init = () => {
  ReactModal.setAppElement(appElement);
  render(<App />, appElement);
};

init();

if (module.hot) {
  module.hot.accept();
}
