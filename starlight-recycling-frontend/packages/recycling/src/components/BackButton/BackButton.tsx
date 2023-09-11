import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import Button from '@material-ui/core/Button';
import { makeStyles, Theme } from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const useStyles = makeStyles(
  (theme: Theme) => ({
    root: {
      backgroundColor: theme.palette.grey[800],
      color: theme.palette.common.white,

      '&:hover': {
        backgroundColor: theme.palette.grey[700],
      },
    },
  }),
  { name: 'BackButton' },
);

export interface BackButtonProps {
  text: string;
  to: string;
  className?: string;
}

export const BackButton: FC<BackButtonProps> = ({ text, to, className }) => {
  const classes = useStyles();

  return (
    <Button
      id="backButton"
      className={classNames(classes.root, className)}
      variant="contained"
      fullWidth
      component={Link}
      to={to}
      startIcon={<ArrowBackIcon />}
    >
      {text}
    </Button>
  );
};

export default BackButton;
