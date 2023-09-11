import React from 'react';
import { Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { haulingTheme } from '@starlightpro/shared-components';
import { ThemeProvider } from 'styled-components';

import { Routes } from '@root/app/container';
import { history } from '@root/core/helpers';

import UserProvider from '../auth/providers/UserProvider/UserProvider';
import { GlobalStyle } from '../core/theme/globalStyle';

import StoreProvider from './providers/StoreProvider/StoreProvider';

import 'react-toastify/dist/ReactToastify.min.css';
import '../core/css/ui.scss';

export const App = () => {
  return (
    <ThemeProvider theme={haulingTheme}>
      <ToastContainer />
      <StoreProvider>
        <Router history={history}>
          <UserProvider>
            <Routes />
          </UserProvider>
        </Router>
      </StoreProvider>
      <GlobalStyle />
    </ThemeProvider>
  );
};
