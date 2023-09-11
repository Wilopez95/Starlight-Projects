import React from 'react';
import { IThemeSizes } from '@starlightpro/shared-components';

import { QuickViewSize } from '../types';

export const getWidth = (size: QuickViewSize, themeSizes: IThemeSizes): string => {
  const containerWidthExpression = `(100vw - ${themeSizes.navigationPanelWidth})`;

  switch (size) {
    case 'full':
      return `calc(${containerWidthExpression})`;
    case 'three-quarters':
      return `calc(${containerWidthExpression} * 0.75)`;
    case 'half':
      return `calc(${containerWidthExpression} * 0.5)`;
    case 'moderate':
      return '550px';
    default:
      return '420px';
  }
};

export const getModalOverlayElement = (
  _: React.ComponentPropsWithRef<'div'>,
  element: React.ReactElement,
) => {
  return <>{element}</>;
};

export const getModalContentElement = (
  _: React.ComponentPropsWithRef<'div'>,
  element: React.ReactNode,
) => {
  return <>{element}</>;
};
