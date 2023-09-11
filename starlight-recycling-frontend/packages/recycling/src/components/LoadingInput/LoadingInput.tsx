import { Box, makeStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React, { FC } from 'react';
import cs from 'classnames';

export interface LoadingInputProps {
  label?: JSX.Element;
}

const useStyles = makeStyles(
  ({ spacing, typography, palette }) => ({
    root: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      marginBottom: spacing(2),
    },
    label: {
      ...typography.body2,
      color: palette.text.secondary,
    },
    field: {
      width: '100%',
      height: 36,
      borderRadius: 3,
      marginTop: spacing(1),
    },
    lineVariant: {
      width: '100%',
      display: 'flex',
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'stretch',

      '& $label': {
        flex: '1 1',
        maxWidth: '268px',
        marginTop: spacing(1),
      },
    },
  }),
  { name: 'LoadingInput' },
);

export interface LoadingInputProps {
  label?: JSX.Element;
  classes?: Partial<Record<'root' | 'label' | 'field', string>>;
  variant?: 'default' | 'line';
}

export const LoadingInput: FC<LoadingInputProps> = ({ label, classes: classesProp, variant }) => {
  const classes = useStyles({ classes: classesProp });

  return (
    <Box className={cs(classes.root, { [classes.lineVariant]: variant === 'line' })}>
      <Box className={classes.label}>
        {label || <Skeleton variant="text" width={100} height={20} />}
      </Box>
      <Skeleton variant="rect" classes={{ root: classes.field }} />
    </Box>
  );
};
