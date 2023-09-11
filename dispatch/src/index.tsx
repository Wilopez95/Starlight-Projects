/* eslint-disable @typescript-eslint/ban-ts-comment */
import "core-js/stable";
import "regenerator-runtime/runtime";
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import App from './App';
import configureStore from './state/store';
import { history } from './utils/history';


// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const appElement = document.getElementById('app')!;
const initialState = {};
const store = configureStore(initialState);

const init = () => {
  render(<Provider store={store}><App history={history}/></Provider>, appElement);
};


init();

if (module.hot) {
  module.hot.accept();
}

