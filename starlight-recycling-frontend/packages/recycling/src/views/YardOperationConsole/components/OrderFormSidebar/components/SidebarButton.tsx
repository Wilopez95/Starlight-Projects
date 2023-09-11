import { Button, ButtonProps, makeStyles, Theme } from '@material-ui/core';
import React, { FC } from 'react';

const useStyles = makeStyles(({ palette }: Theme) => ({
  button: {
    backgroundColor: palette.orange,
    '&:hover': {
      backgroundColor: palette.orange,
    },
    '&:disabled': {
      backgroundColor: 'transparent',
      border: '1px solid #fff',
      color: palette.common.white,
    },
  },
}));

export const SidebarButton: FC<ButtonProps> = (props) => {
  const classes = useStyles();

  return <Button className={classes.button} {...props} />;
};
