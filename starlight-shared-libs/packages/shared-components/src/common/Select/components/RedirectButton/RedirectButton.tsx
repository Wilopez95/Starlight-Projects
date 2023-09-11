import React from 'react';

import { PlusIcon } from '../../../../assets';
import { Layouts } from '../../../../layouts';
import { Typography } from '../../../Typography/Typography';

import * as Styles from './styles';
import { IRedirectButton } from './types';

export const RedirectButton: React.FC<IRedirectButton> = ({ children, onClick }) => {
  return (
    <Styles.StyledRedirectButton onClick={onClick} role="button" tabIndex={0}>
      <Layouts.Flex alignItems="flex-end" flexGrow={1}>
        <Layouts.IconLayout width="12px" height="12px">
          <PlusIcon />
        </Layouts.IconLayout>
        <Typography color="information">{children}</Typography>
      </Layouts.Flex>
    </Styles.StyledRedirectButton>
  );
};
