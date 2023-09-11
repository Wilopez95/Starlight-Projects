/* eslint-disable react/prop-types */
import { Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ToastContainer } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import UserProvider from './providers/UserProvider/UserProvider';
import { AppRoutes } from './routes/Routes';
import { GlobalStyle } from './auth/theme/globalStyle';
import theme from './auth/theme/theme';
import './static/mapSpider.css';
import './static/scss/main.scss';

// @ts-expect-error history
function App({ history }) {
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <ToastContainer autoClose={8000} />
        <Router history={history}>
          <UserProvider>
            <AppRoutes />
          </UserProvider>
        </Router>
      </ErrorBoundary>
      <GlobalStyle />
    </ThemeProvider>
  );
}

export default App
