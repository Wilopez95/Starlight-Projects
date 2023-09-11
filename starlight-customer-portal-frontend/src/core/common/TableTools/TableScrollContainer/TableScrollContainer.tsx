import React, { forwardRef } from 'react';

import * as Styles from './styles';
import { ITableScrollContainer } from './types';

export const TableScrollContainer = forwardRef<HTMLDivElement, ITableScrollContainer>(
  ({ children, className, scrollClassName }, ref) => {
    return (
      <Styles.Container className={className}>
        <Styles.TableScroll className={scrollClassName} overflowY='scroll' ref={ref}>
          {children}
        </Styles.TableScroll>
      </Styles.Container>
    );
  },
);
