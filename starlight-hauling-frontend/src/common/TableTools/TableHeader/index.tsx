import React from 'react';

import * as Styles from './styles';
import { ITableHeader } from './types';

export const TableHeader: React.FC<ITableHeader> = ({ children, className, sticky = true }) => (
  <Styles.TableHeaderStyled sticky={sticky} className={className}>
    <tr>{children}</tr>
  </Styles.TableHeaderStyled>
);
