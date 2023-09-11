import React, { memo, useCallback, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { Document, Page } from 'react-pdf';
import { range } from 'lodash-es';
import { Trans } from '../../../../i18n';
import { Box } from '@material-ui/core';

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

export interface IPdfViewer {
  url?: string;
}

export const PdfViewer: React.FC<IPdfViewer> = memo(({ url }) => {
  const [amountPages, setAmountPages] = useState<number | null>(null);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(({ numPages }: { numPages: number }) => {
    setAmountPages(numPages);
    setError(false);
  }, []);

  const handleError = useCallback((errorData: unknown) => {
    // eslint-disable-next-line no-console
    console.error('pdf load error: ', errorData);
    setError(true);
  }, []);

  if (!url) {
    return (
      <Box>
        <Trans>Error. No pdf url provided</Trans>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Trans>Error. Unable to load pdf content</Trans>
      </Box>
    );
  }

  return (
    <Document file={url} onLoadError={handleError} onLoadSuccess={handleLoad}>
      {amountPages &&
        amountPages > 0 &&
        range(1, amountPages + 1).map((page) => <Page pageNumber={page} key={page} />)}
    </Document>
  );
});
