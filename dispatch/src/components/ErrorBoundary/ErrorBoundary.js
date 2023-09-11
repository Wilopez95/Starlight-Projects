/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
/* eslint-disable handle-callback-err, no-unused-vars */

import * as React from 'react';
import * as Sentry from '@sentry/react';
import ErrorBoundaryFallbackComponent from './ErrorBoundaryFallbackComponent';

// type Props = {
//   children: React$Node,
//   FallbackComponent: ComponentType<any>,
//   onError?: (error: Error, componentStack: string) => void,
// };

// type ErrorInfo = {
//   componentStack: string,
// };

// type State = {
//   error: null | Error,
//   info: null | ErrorInfo,
//   eventId?: null | string,
// };

class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  static defaultProps = {
    FallbackComponent: ErrorBoundaryFallbackComponent,
  };

  state = {
    error: null,
    info: null,
    eventId: null,
  };

  componentDidCatch(error, info) {
    const { onError } = this.props;

    if (typeof onError === 'function') {
      try {
        onError.call(this, error, info ? info.componentStack : '');
        // eslint-disable-next-line
      } catch (ignoredError) {
        return;
      }
    }

    let canvas;
    let ctx;

    try {
      canvas = document.createElement('canvas');
      ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch (e) {
      // eslint-disable-next-line consistent-return
      return e;
    }

    if (ctx) {
      this.webGLSupported = true;
    } else {
      this.webGLSupported = false;
    }

    Sentry.withScope((scope) => {
      scope.setExtras(info);
      Sentry.captureMessage('Captured in the error boundary', 'info');
      scope.setFingerprint([window.location.pathname]);
      const eventId = Sentry.captureException(error);
      this.setState({ error, info, eventId });
    });
  }

  webGLSupported;

  render() {
    const { children, FallbackComponent } = this.props;
    const { error, info } = this.state;

    if (error !== null) {
      return (
        <FallbackComponent
          componentStack={info ? info.componentStack : ''}
          error={error}
          eventId={this.state.eventId}
          glError={!this.webGLSupported}
        />
      );
    }

    return children;
  }
}

export const withErrorBoundary = (Component, FallbackComponent, onError) => (props) =>
  (
    <ErrorBoundary FallbackComponent={FallbackComponent} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

export default ErrorBoundary;
