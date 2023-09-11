import React, { FC } from 'react';

import Box from '@material-ui/core/Box';

import { makeStyles } from '@material-ui/core/styles';
import InfoIcon from '../icons/Info';

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    display: 'flex',
    padding: spacing(1.5, 3),
    alignItems: 'center',
    borderRadius: 4,
    maxWidth: 'fit-content',
    width: '570px',
    backgroundColor: palette.orangeLight,
    margin: spacing(2, 0),
  },
  iconBox: {
    width: 24,
  },
  icon: {
    color: palette.coreMain300,
  },
  content: {
    marginLeft: spacing(2),
  },
}));

export interface WarningProps {
  classes?: {
    root?: string;
    iconBox?: string;
  };
}

export const Warning: FC<WarningProps> = ({ children, classes: classesProp }) => {
  const classes = useStyles({ classes: classesProp });

  return (
    <Box className={classes.root}>
      <Box className={classes.iconBox}>
        <InfoIcon className={classes.icon} />
      </Box>
      <Box className={classes.content}>{children}</Box>
    </Box>
  );
};

export default Warning;
