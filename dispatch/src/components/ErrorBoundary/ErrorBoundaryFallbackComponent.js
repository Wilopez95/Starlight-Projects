/* eslint-disable react/prop-types */
import { useState } from 'react';
import * as Sentry from '@sentry/react';
import styled from 'styled-components';

// type Props = {
//   componentStack: string,
//   error: null | Error,
//   eventId?: null | string,
//   glError: boolean,
// };

const toTitle = (error, componentStack) =>
  `${error.toString()}\n\nThis is located at:${componentStack}`;

const PageContainer = styled.div`
  width: 100%;
  padding: 60px 20px;
`;

const Content = styled.div`
  max-width: 46em;
  margin: 0 auto;
`;

const Text = styled.p`
  margin-top: 0;
  font-size: 1em;
`;

function ErrorBoundaryFallbackComponent({ componentStack, error, eventId, glError }) {
  const [showError, setShowError] = useState(false);
  const handleShowError = () => {
    setShowError(!showError);
  };
  return (
    <PageContainer>
      <Content>
        {glError ? (
          <>
            <h2>Something Unexpected Happened</h2>
            <Text>
              Your browser does not support WebGL. Please enable this setting and refresh.
            </Text>
          </>
        ) : (
          <>
            <h2>Something Unexpected Happened</h2>
            <Text>
              Sorry, an error occurred and our team has been notified. Please try reloading the
              page, it may have been a temporary glitch.
            </Text>
          </>
        )}
        <button
          className="button button__primary button__lrg mt-5 mb-2"
          type="button"
          onClick={() => Sentry.showReportDialog({ eventId })}
        >
          Report feedback
        </button>
        <button
          className="button button__empty button__lrg mb-3"
          type="button"
          onClick={handleShowError}
        >
          Show Error Details
        </button>
        <div>{showError ? toTitle(error, componentStack) : null}</div>
      </Content>
    </PageContainer>
  );
}

export default ErrorBoundaryFallbackComponent;
