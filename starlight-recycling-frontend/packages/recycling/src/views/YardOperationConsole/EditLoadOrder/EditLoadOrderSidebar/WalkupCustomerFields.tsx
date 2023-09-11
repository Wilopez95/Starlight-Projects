import React from 'react';
import { Box } from '@material-ui/core';
import { NoteInput } from '../../Inputs';
import { ReadOnlyOrderFormComponent } from '../../types';

interface Props extends ReadOnlyOrderFormComponent {}

export const WalkupCustomerFields: React.FC<Props> = ({ readOnly }) => {
  return (
    <Box>
      <NoteInput readOnly={readOnly} />
    </Box>
  );
};
