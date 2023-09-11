import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@material-ui/core/styles';
import { ToastProvider } from '@starlightpro/common';

import App from './App';
import * as serviceWorker from './serviceWorker';
import CssBaseline from '@material-ui/core/CssBaseline';
import './i18n';
import './service/printnode/printnode-ws-http-client';
import { PageTitleProvider } from './components/PageTitle';
import { client } from './service/graphql';
import { Router } from './routes';
import theme from './theme';
import { DocumentTitleProvider } from './components/DocumentTitle';

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback="loading">
      <CssBaseline />
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <Router>
            <ToastProvider />
            <DocumentTitleProvider>
              <PageTitleProvider>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                  <App />
                </MuiPickersUtilsProvider>
              </PageTitleProvider>
            </DocumentTitleProvider>
          </Router>
        </ThemeProvider>
      </ApolloProvider>
    </Suspense>
  </React.StrictMode>,
  document.getElementById('root'),
);

// if ((module as any).hot) {
//   (module as any).hot.accept('./App', () => {
//     const NextApp = require('./App').default;

//     ReactDOM.render(
//       <React.StrictMode>
//         <Suspense fallback='loading'>
//           <CssBaseline />
//           <ApolloProvider client={client}>
//             <ThemeProvider theme={theme}>
//               <Router history={history}>
//                 <NextApp />
//               </Router>
//             </ThemeProvider>
//           </ApolloProvider>
//         </Suspense>
//       </React.StrictMode>,
//       document.getElementById('root'),
//     );
//   });
// }

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
