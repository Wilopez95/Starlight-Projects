import React, { createContext, ReactNode, useState } from 'react';

interface MapContext {
  pageTitle?: ReactNode;
  setPageTitle(title: ReactNode): void;
}

export const PageTitleContext = createContext<MapContext>({ setPageTitle() {} });

export const PageTitleProvider: React.FC = ({ children }) => {
  const [pageTitle, setPageTitle] = useState('');

  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
};
