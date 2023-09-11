import React from 'react';
import { IconButton, makeStyles } from '@material-ui/core';
import CloseIcon from '../../../../components/icons/Close';
import { closeSidePanel } from '../../../../components/SidePanels';

const useStyles = makeStyles({
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

export const CloseButton = () => {
  const classes = useStyles();

  return (
    <IconButton
      className={classes.closeButton}
      aria-label="close"
      onClick={closeSidePanel}
      size="medium"
    >
      <CloseIcon fontSize="inherit" />
    </IconButton>
  );
};
