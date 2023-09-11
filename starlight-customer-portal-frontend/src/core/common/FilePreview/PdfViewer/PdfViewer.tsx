import React, { memo, useCallback, useState } from 'react';
import { Document } from 'react-pdf';
import * as Sentry from '@sentry/react';
import { Layouts } from '@starlightpro/shared-components';
import { range } from 'lodash-es';

import { PdfPlaceholderIcon } from '@root/assets';
import { useElementWidth } from '@root/hooks';

import * as Styles from './styles';
import { IPdfViewer } from './types';

export const PdfViewer: React.FC<IPdfViewer> = memo(({ url }) => {
  const [amountPages, setAmountPages] = useState<number | null>(null);
  const [error, setError] = useState(false);

  const [containerRef, width] = useElementWidth();

  const handleLoad = useCallback(({ numPages }: { numPages: number }) => {
    setAmountPages(numPages);
    setError(false);
  }, []);

  const handleError = useCallback(
    (errorInfo: Error) => {
      Sentry.addBreadcrumb({
        category: 'PdfViewer',
        message: JSON.stringify(errorInfo.message),
      });
      Sentry.captureException(error);

      setError(true);
    },
    [error],
  );

  if (!url) {
    return null;
  }

  if (error) {
    return (
      <Layouts.IconLayout width='64px' height='64px'>
        <PdfPlaceholderIcon />
      </Layouts.IconLayout>
    );
  }

  return (
    <Styles.PdfContainer ref={containerRef}>
      <Document file={url} onLoadError={handleError} onLoadSuccess={handleLoad}>
        {amountPages && amountPages > 0
          ? range(1, amountPages + 1).map((page) => (
              <Styles.Page width={width > 0 ? width - 40 : 0} pageNumber={page} key={page} />
            ))
          : null}
      </Document>
    </Styles.PdfContainer>
  );
});
