import React, { FC, ReactNode } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import FormHelperText from '@material-ui/core/FormHelperText';

const useStyles = makeStyles(
  ({ typography, palette }) => ({
    root: {
      ...typography.body2,
      color: palette.error.dark,
    },
  }),
  { name: 'FormErrorText' },
);

export interface FieldErrorTextProps {
  error?: ReactNode | string;
  touched?: boolean;
  classes?: {
    root?: string;
  };
}

export const FormErrorText: FC<FieldErrorTextProps> = ({
  classes: classesProp,
  touched,
  error,
}) => {
  const classes = useStyles({ classes: classesProp });

  return <FormHelperText classes={{ root: classes.root }}>{touched && error}</FormHelperText>;
};

export default FormErrorText;
