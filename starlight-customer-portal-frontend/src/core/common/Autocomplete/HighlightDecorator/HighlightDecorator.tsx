import React from 'react';

import { IHighlightDecorator } from './types';

import styles from './css/styles.scss';

export const HighlightDecorator: React.FC<IHighlightDecorator> = ({
  children,
  highlight,
  property,
  className,
  index,
}) => {
  if (property in highlight) {
    const value = highlight[property] || [];

    if (
      Array.isArray(value) &&
      value.length &&
      typeof index === 'number' &&
      Array.isArray(value[0])
    ) {
      return (
        <span dangerouslySetInnerHTML={{ __html: value[0][index] }} className={styles.selected} />
      );
    }
    if (value[0]) {
      return <span dangerouslySetInnerHTML={{ __html: value[0] }} className={styles.selected} />;
    }
  }

  return <span className={className}>{children}</span>;
};
