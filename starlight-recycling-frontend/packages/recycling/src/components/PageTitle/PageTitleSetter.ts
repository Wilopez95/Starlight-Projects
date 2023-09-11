import React, { ReactNode, useContext, useEffect } from 'react';
import { PageTitleContext } from './PageTitleContext';

interface PageTitleSetterProps {
  pageTitle: ReactNode;
}

export const PageTitleSetter: React.FC<PageTitleSetterProps> = ({ pageTitle }) => {
  const { setPageTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setPageTitle(pageTitle);
  }, [pageTitle, setPageTitle]);

  return null;
};

PageTitleSetter.displayName = 'PageTitleSetter';
