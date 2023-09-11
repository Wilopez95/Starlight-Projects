import React, { FC, ReactElement } from 'react';
import classNames from 'classnames';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(
  ({ spacing, palette }) => ({
    root: {
      height: 90,
      textTransform: 'none',
      color: palette.common.white,
    },
    text: {
      fontSize: '14px',
      marginTop: spacing(1),
    },
    colorPrimary: {
      backgroundColor: palette.primary.main,
    },
    colorSecondary: {
      backgroundColor: palette.orange,
    },
  }),
  { name: 'YardButton' },
);

export interface YardButtonProps {
  color?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
  image?: ReactElement;
  text?: string;
  id?: string;
  disabled?: boolean;
}

export const YardButton: FC<YardButtonProps> = ({
  color = 'primary',
  className,
  image,
  text,
  onClick,
  id,
  ...props
}) => {
  const classes = useStyles();

  return (
    <Button
      {...props}
      className={classNames(classes.root, className, {
        [classes.colorPrimary]: color === 'primary',
        [classes.colorSecondary]: color === 'secondary',
      })}
      variant="contained"
      fullWidth
      onClick={onClick}
      id={id}
    >
      <Box display="flex" flexDirection="column" alignItems="center" height="100%">
        {image}
        <Typography variant="subtitle2" className={classes.text}>
          {text}
        </Typography>
      </Box>
    </Button>
  );
};

export default YardButton;
