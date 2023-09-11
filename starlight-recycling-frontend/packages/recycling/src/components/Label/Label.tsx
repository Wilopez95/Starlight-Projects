import React, { FC } from 'react';
import classNames from 'classnames';
import { createStyles, fade, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(
  ({ spacing, palette }) =>
    createStyles({
      root: {
        borderRadius: 2,
        padding: spacing(1 / 4, 1 / 2),
        fontSize: 14,
      },
      active: {
        color: palette.success.main,
        backgroundColor: fade(palette.success.main, 0.1),
      },
      inactive: {
        color: palette.grey[600],
        backgroundColor: palette.grey[200],
      },
      blue: {
        color: palette.blue,
        backgroundColor: palette.blueBackground,
      },
      lightBlue: {
        color: palette.lightBlue,
        backgroundColor: palette.lightBlueBackground,
      },
      orange: {
        color: palette.orange,
        backgroundColor: palette.orangeBackground,
      },
      lightGrey: {
        color: palette.grey[800],
        backgroundColor: palette.grey[100],
      },
      inProgress: {
        color: palette.grey[600],
        backgroundColor: palette.grey[200],
      },
    }),
  {
    name: 'Label',
  },
);

export type LabelVariant =
  | 'active'
  | 'inactive'
  | 'blue'
  | 'lightBlue'
  | 'orange'
  | 'lightGrey'
  | 'inProgress';

export interface LabelProps {
  variant: LabelVariant;
  className?: string;
  fontSize?: string;
}

export const Label: FC<LabelProps> = ({ variant, children, className }) => {
  const classes = useStyles();

  return <span className={classNames(classes.root, classes[variant], className)}>{children}</span>;
};

export default Label;
