import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { DocumentTitleContext } from './DocumentTitleContext';

/**
 * Set document's html title (<title></title> tag inside <head></head>) using react-helmet library and context
 */
export const DocumentTitle: React.FC = () => {
  const { documentTitle } = useContext(DocumentTitleContext);

  return (
    <Helmet>
      <title>{documentTitle}</title>
    </Helmet>
  );
};

DocumentTitle.displayName = 'DocumentTitle';
