import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { haulingTheme } from '@starlightpro/shared-components';
import { ThemeProvider } from 'styled-components';

import { AppRoutes } from '@root/routes';
import { GlobalStyle, RoutePlannerGlobalStyle } from '@root/theme';

import history from './history';
import { StoreProvider, UserProvider } from './providers';

import 'react-toastify/dist/ReactToastify.min.css';
import './css/ui.scss';

export const App = () => (
  <ThemeProvider theme={haulingTheme}>
    <ToastContainer />
    <StoreProvider>
      <DndProvider backend={HTML5Backend}>
        <Router history={history}>
          <UserProvider>
            <AppRoutes />
          </UserProvider>
        </Router>
      </DndProvider>
    </StoreProvider>
    <GlobalStyle />
    <RoutePlannerGlobalStyle />
  </ThemeProvider>
);
