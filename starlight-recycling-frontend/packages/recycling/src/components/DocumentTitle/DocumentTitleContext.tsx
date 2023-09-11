import React, { createContext, ReactNode, useState } from 'react';

interface MapDocumentTitleContext {
  documentTitle?: ReactNode;
  setDocumentTitle(title: ReactNode): void;
}

export const DocumentTitleContext = createContext<MapDocumentTitleContext>({
  setDocumentTitle() {},
});

export const DocumentTitleProvider: React.FC = ({ children }) => {
  const [documentTitle, setDocumentTitle] = useState('');

  return (
    <DocumentTitleContext.Provider value={{ documentTitle, setDocumentTitle }}>
      {children}
    </DocumentTitleContext.Provider>
  );
};
