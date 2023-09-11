import React from 'react';
import { Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { haulingTheme } from '@starlightpro/shared-components';
import { ThemeProvider } from 'styled-components';

import { OverlayControllerProvider } from '@root/components/OverlayControllerContext/OverlayControllerContext';
import { AppRoutes } from '@root/routes';

import { RecyclingProvider, StoreProvider, UserProvider } from './components';
import { GlobalStyle } from './globalStyle';
import history from './history';

import 'react-toastify/dist/ReactToastify.min.css';
import './css/ui.scss';

export const App = () => (
  <ThemeProvider theme={haulingTheme}>
    <ToastContainer />
    <StoreProvider>
      <OverlayControllerProvider>
        <Router history={history}>
          <UserProvider>
            <RecyclingProvider>
              <AppRoutes />
            </RecyclingProvider>
          </UserProvider>
        </Router>
      </OverlayControllerProvider>
    </StoreProvider>
    <GlobalStyle />
  </ThemeProvider>
);
