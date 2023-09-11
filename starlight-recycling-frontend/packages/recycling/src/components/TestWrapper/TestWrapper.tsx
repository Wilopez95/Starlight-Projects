import React, { FC, Suspense } from 'react';
import { ApolloProvider } from '@apollo/client';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { client } from '../../service/graphql';
import theme from '../../theme';
import { Router } from '../../routes';
import { ToastProvider } from '@starlightpro/common';
import { DocumentTitleProvider } from '../DocumentTitle';
import { PageTitleProvider } from '../PageTitle';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';

export const TestWrapper: FC = ({ children }) => (
  <React.StrictMode>
    <Suspense fallback="loading">
      <CssBaseline />
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <Router>
            <ToastProvider />
            <DocumentTitleProvider>
              <PageTitleProvider>
                <MuiPickersUtilsProvider utils={MomentUtils}>{children}</MuiPickersUtilsProvider>
              </PageTitleProvider>
            </DocumentTitleProvider>
          </Router>
        </ThemeProvider>
      </ApolloProvider>
    </Suspense>
  </React.StrictMode>
);
