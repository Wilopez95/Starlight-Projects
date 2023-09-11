import React from 'react';

import * as OptionStyles from '../Option/styles';

import { IFooterOption } from './types';

export const FooterOption: React.FC<IFooterOption> = ({ children, onClick }) => {
  return (
    <OptionStyles.StyledOption padding="1.5" as="li" onClick={onClick} borderVariant="both" footer>
      {children}
    </OptionStyles.StyledOption>
  );
};
