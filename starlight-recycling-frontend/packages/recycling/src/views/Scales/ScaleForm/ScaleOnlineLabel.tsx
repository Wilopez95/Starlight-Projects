import React, { FC } from 'react';

import { useField } from 'react-final-form';
import Label from '../../../components/Label';
import { Trans } from '../../../i18n';
import { printNodeMockedScale } from '../../../constants';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(
  ({ spacing }) => ({
    root: {
      display: 'flex',
      marginBottom: spacing(2),
    },
    statusLabel: {
      flex: 1,
    },
    valueLabel: {
      flex: 1,
    },
  }),
  { name: 'ScaleOnlineLabel' },
);

export interface OnlineLabelProps {}

export const ScaleOnlineLabel: FC<OnlineLabelProps> = () => {
  const classes = useStyles();
  const {
    input: { value: scale },
  } = useField('scale', { subscription: { value: true } });
  const active = scale && scale.deviceName !== printNodeMockedScale.deviceName;

  return (
    <Box className={classes.root}>
      <Typography variant="body2" color="textSecondary" className={classes.statusLabel}>
        <Trans>Status</Trans>
      </Typography>
      <Box className={classes.valueLabel}>
        <Label variant={active ? 'active' : 'inProgress'}>
          {active ? <Trans>Online</Trans> : <Trans>Offline</Trans>}
        </Label>
      </Box>
    </Box>
  );
};
