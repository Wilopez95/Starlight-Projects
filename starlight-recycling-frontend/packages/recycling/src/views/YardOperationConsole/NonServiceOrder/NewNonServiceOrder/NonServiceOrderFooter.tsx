import React, { FC } from 'react';
import { Trans } from '../../../../i18n';
import { Box, Button, Divider, makeStyles } from '@material-ui/core';

import { closeSidePanel } from '../../../../components/SidePanels';
import { SaveButton } from '../../components/SaveButton';

const useStyles = makeStyles(
  ({ spacing }) => ({
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
  }),
  { name: 'NonServiceOrderFooter' },
);

export const NonServiceOrderFooter: FC = () => {
  const classes = useStyles();

  return (
    <Box className={classes.footer}>
      <Divider />
      <Box display="flex" flexShrink="0" justifyContent="space-between" alignItems="flex-end">
        <Box display="flex" mt={3} className={classes.leftActions}>
          <Button variant="outlined" color="primary" onClick={closeSidePanel}>
            <Trans>Cancel</Trans>
          </Button>
        </Box>
        <Box display="flex" className={classes.rightActions}>
          <SaveButton variant="contained">
            <Trans>Create new order</Trans>
          </SaveButton>
        </Box>
      </Box>
    </Box>
  );
};
