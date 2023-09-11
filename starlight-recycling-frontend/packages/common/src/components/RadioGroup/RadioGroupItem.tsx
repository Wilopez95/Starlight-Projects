import React, { memo } from 'react';
import FormControlLabel, { FormControlLabelProps } from '@material-ui/core/FormControlLabel';
import Radio, { RadioProps } from '../Radio';
import { makeStyles } from '@material-ui/core/styles';

export interface RadioGroupItemProps extends Omit<FormControlLabelProps, 'control'> {
  color?: RadioProps['color'];
  name?: string;
}

const useStyles = makeStyles(({ palette }) => ({
  root: {
    borderRadius: 4,

    '&:focus-visible, &:active': {
      outline: `2px solid ${palette.orange}`,
    },
  },
}));

// name will be populated from RadioGroup or passed in props directly
export const RadioGroupItem = memo<Omit<RadioGroupItemProps, 'control'>>((props) => {
  const classes = useStyles();

  return (
    <FormControlLabel
      className={classes.root}
      {...props}
      tabIndex={0}
      control={<Radio color={props.color || 'default'} />}
    />
  );
});

export default RadioGroupItem;
