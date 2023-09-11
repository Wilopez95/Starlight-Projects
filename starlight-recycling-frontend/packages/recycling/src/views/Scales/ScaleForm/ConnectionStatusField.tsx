import React, { FC } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { useField } from 'react-final-form';
import { Box, Typography } from '@material-ui/core';
import { Trans } from '../../../i18n';
import Label from '../../../components/Label';
import {
  scaleConnectionStatusTranslationMapping,
  scaleConnectionStatusLabelVariant,
} from '../constants';
import { ScaleConnectionStatus } from '../../../graphql/api';

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
  { name: 'ConnectionStatusField' },
);

export interface ConnectionStatusFieldProps {}

export const ConnectionStatusField: FC<ConnectionStatusFieldProps> = () => {
  const classes = useStyles();
  const {
    input: { value: connectionStatus },
  } = useField('connectionStatus', { subscription: { value: true } });

  return (
    <Box className={classes.root}>
      <Typography variant="body2" color="textSecondary" className={classes.statusLabel}>
        <Trans>Connection</Trans>
      </Typography>
      <Box className={classes.valueLabel}>
        <Label
          variant={scaleConnectionStatusLabelVariant[connectionStatus as ScaleConnectionStatus]}
        >
          {scaleConnectionStatusTranslationMapping[connectionStatus as ScaleConnectionStatus]}
        </Label>
      </Box>
    </Box>
  );
};
