import React from 'react';

import * as OptionStyles from '../Option/styles';

import { IOptionFooter } from './types';

export const Footer: React.FC<IOptionFooter> = ({ children, onClick }) => {
  return (
    <OptionStyles.StyledOption top='2' left='2' bottom='2' right='2' as='li' onClick={onClick}>
      {children}
    </OptionStyles.StyledOption>
  );
};
