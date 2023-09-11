import React, { FC } from 'react';
import { Trans } from '../../../../i18n';
import { Box, Button, Divider, makeStyles } from '@material-ui/core';

import { SaveButton } from '../../components/SaveButton';
import { ReadOnlyOrderFormComponent } from '../../types';
import { closeSidePanel } from '../../../../components/SidePanels';

const useStyles = makeStyles(({ spacing }) => ({
  footer: {
    padding: spacing(0, 4, 3, 4),
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  rightActions: {
    '& > *': {
      marginRight: spacing(2),
    },
    '& > *:last-child': {
      marginRight: 0,
    },
  },
  leftActions: {
    '& > *': {
      marginRight: spacing(2),
    },
    '& > *:last-child': {
      marginRight: 0,
    },
  },
}));

interface Props extends ReadOnlyOrderFormComponent {}

export const ApprovedOrderFooter: FC<Props> = ({ readOnly }) => {
  const classes = useStyles();

  return (
    <Box className={classes.footer}>
      <Divider />
      <Box display="flex" flexShrink="0" justifyContent="space-between" alignItems="flex-end">
        <Box display="flex" mt={3} className={classes.leftActions}>
          <Button variant="outlined" color="primary" onClick={closeSidePanel}>
            {!readOnly && <Trans>Cancel</Trans>}
            {readOnly && <Trans>Close</Trans>}
          </Button>
        </Box>
        {!readOnly && (
          <Box display="flex" className={classes.rightActions}>
            <SaveButton />
          </Box>
        )}
      </Box>
    </Box>
  );
};
