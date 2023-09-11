import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import Button from '@material-ui/core/Button';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { PropTypes } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    textTransform: 'capitalize',
    fontSize: theme.typography.body1.fontSize,
  },
}));

export interface TopNavigationButtonProps {
  className?: string;
  color: PropTypes.Color;
  to: string;
  onClick?: () => void;
}

export const TopNavigationButton: FC<TopNavigationButtonProps> = ({
  to,
  className,
  children,
  color,
  onClick,
}) => {
  const classes = useStyles();

  return (
    <Button
      className={classNames(classes.root, className)}
      variant="contained"
      color={color}
      component={Link}
      to={to}
      fullWidth
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default TopNavigationButton;
