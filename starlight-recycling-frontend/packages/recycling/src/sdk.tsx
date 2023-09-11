import React, { Suspense, StrictMode, FC, useMemo } from 'react';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createApolloClient, ToastProvider } from '@starlightpro/common';
import { AuthProviderLink } from '@starlightpro/common/service/auth';
import { UserInfoInput } from '@starlightpro/common/graphql/api';

import './i18n';
import './service/printnode/printnode-ws-http-client';
import { PageTitleProvider } from './components/PageTitle';
import { clientConfig } from './service/graphql';
import recyclingTheme from './theme';
import { DocumentTitleProvider } from './components/DocumentTitle';
import { ThemeProviderProps } from '@material-ui/styles/ThemeProvider/ThemeProvider';

export interface RecyclingProviderProps {
  apiUrl: string;
  userInfo?: Omit<UserInfoInput, 'expiresAt' | 'refreshExpiresAt' | 'refreshToken'> | null;
  theme?: ThemeProviderProps['theme'];
}

export const RecyclingProvider: FC<RecyclingProviderProps> = ({
  children,
  apiUrl,
  userInfo,
  theme = recyclingTheme,
}) => {
  const client = useMemo(() => {
    const clientUserInfo = userInfo
      ? {
          id: userInfo.id,
          token: userInfo.token,
          refreshToken: '',
          expiresAt: '',
          refreshExpiresAt: '',
          firstName: userInfo.firstName,
          lastName: userInfo.firstName,
          permissions: userInfo.permissions,
          email: userInfo.email,
          resource: userInfo.resource,
        }
      : null;

    return createApolloClient({
      ...clientConfig,
      graphqlUri: `${apiUrl}/graphql`,
      getInitialUserInfo: () => clientUserInfo,
      authLink: new AuthProviderLink(),
    });
  }, [userInfo, apiUrl]);

  return (
    <StrictMode>
      <Suspense fallback="loading">
        <ApolloProvider client={client}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToastProvider />
            <DocumentTitleProvider>
              <PageTitleProvider>
                <MuiPickersUtilsProvider utils={MomentUtils}>{children}</MuiPickersUtilsProvider>
              </PageTitleProvider>
            </DocumentTitleProvider>
          </ThemeProvider>
        </ApolloProvider>
      </Suspense>
    </StrictMode>
  );
};
