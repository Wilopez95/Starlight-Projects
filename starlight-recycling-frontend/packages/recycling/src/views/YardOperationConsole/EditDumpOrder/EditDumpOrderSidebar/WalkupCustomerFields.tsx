import React from 'react';
import { Box, Divider, makeStyles } from '@material-ui/core';
import { MaterialInput, NoteInput, OriginDistrictInput } from '../../Inputs';
import { ReadOnlyOrderFormComponent } from '../../types';

const useStyles = makeStyles(({ spacing }) => ({
  sidePanelDivider: {
    marginTop: spacing(2),
    marginBottom: spacing(2),
  },
}));

interface Props extends ReadOnlyOrderFormComponent {
  isInputFieldBlocked?: boolean;
}

export const WalkupCustomerFields: React.FC<Props> = ({ readOnly, isInputFieldBlocked }) => {
  const classes = useStyles();

  return (
    <Box>
      <MaterialInput readOnly={readOnly || isInputFieldBlocked} />
      <OriginDistrictInput readOnly={readOnly} />
      <Divider className={classes.sidePanelDivider} />
      <NoteInput readOnly={readOnly} />
    </Box>
  );
};
