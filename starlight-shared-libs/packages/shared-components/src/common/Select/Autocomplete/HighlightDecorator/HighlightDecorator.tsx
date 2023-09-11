import React from 'react';

import * as Styles from './styles';
import { IHighlightDecorator } from './types';

export const HighlightDecorator: React.FC<IHighlightDecorator> = ({
  children,
  highlight,
  property,
  className,
  index,
}) => {
  if (highlight && property in highlight) {
    const valuesArray: string[] = highlight[property] || [];

    const highlightHtml = typeof index === 'number' ? valuesArray[0][index] : valuesArray[0];

    if (highlightHtml) {
      return (
        <Styles.Highlighted
          dangerouslySetInnerHTML={{ __html: highlightHtml }}
          className={className}
        />
      );
    }
  }

  return <span className={className}>{children}</span>;
};
