import React, { FC } from 'react';
import cs from 'classnames';
import { omit } from 'lodash-es';
import TextFieldInput, { TextFieldProps, TextFieldClassKey } from '../TextField';
import { makeStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/styles/withStyles';

export type LineTextFieldClassKey = TextFieldClassKey | 'labelRoot' | 'fullWidth';

const useStyles = makeStyles(
  ({ spacing }) => ({
    root: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'flex-start',
      justifyContent: 'stretch',
      display: 'flex',
    },
    formControl: {
      '&$fullWidth': {
        width: '100%',
      },
    },
    formControlInner: {
      flex: '1 1',
      overflow: 'hidden',
    },
    fullWidth: {},
    labelRoot: {
      flex: '1 1',
      maxWidth: 268,
      marginTop: spacing(1),
    },
    formHelperTextRoot: {
      marginBottom: 0,
    },
  }),
  { name: 'LineTextField' },
);

export interface LineTextFieldProps extends TextFieldProps {
  classes?: Partial<ClassNameMap<LineTextFieldClassKey>>;
  TextField?: typeof TextFieldInput;
}

export const LineTextField: FC<LineTextFieldProps> = (props) => {
  const classes = useStyles(props);
  const TextField = props.TextField || TextFieldInput;

  return (
    <TextField
      {...props}
      classes={{
        ...omit(props.classes, 'labelRoot'),
        root: classes.root,
        formControlInner: classes.formControlInner,
        formControl: cs(classes.formControl, {
          [classes.fullWidth]: props.fullWidth,
        }),
        formHelperTextRoot: classes.formHelperTextRoot,
      }}
      InputLabelProps={{
        classes: {
          root: classes.labelRoot,
        },
      }}
    />
  );
};

export default LineTextField;
