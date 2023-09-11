import React, { memo } from 'react';
import cs from 'classnames';
import RadioButtonCheckedIcon from './RadioButtonCenterCircle';
import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
  ({ transitions, palette }) => ({
    root: {
      position: 'relative',
      display: 'flex',
      '&$checked $layer': {
        transform: 'scale(1)',
        transition: transitions.create('transform', {
          easing: transitions.easing.easeOut,
          duration: transitions.duration.shortest,
        }),
      },

      '&$disabled $uncheckedIcon': {
        borderColor: palette.grey[200],
      },
      '&$disabled $layer': {
        color: palette.grey[200],
      },
    },
    uncheckedIcon: {
      width: '16px',
      height: '16px',
      border: `1px solid ${palette.grey[300]}`,
      borderRadius: '50%',
    },
    disabled: {},
    layer: {
      top: -2,
      left: -2,
      position: 'absolute',
      transform: 'scale(0)',
      transition: transitions.create('transform', {
        easing: transitions.easing.easeIn,
        duration: transitions.duration.shortest,
      }),
    },
    checked: {},
  }),
  { name: 'RadioButtonIcon' },
);

export interface RadioButtonIconProps {
  checked?: boolean;
  disabled?: boolean;
}

export const RadioButtonIcon = memo<RadioButtonIconProps>(({ checked, disabled }) => {
  const classes = useStyles();

  return (
    <div
      className={cs(classes.root, {
        [classes.checked]: checked,
        [classes.disabled]: disabled,
      })}
    >
      <div className={classes.uncheckedIcon} />
      <RadioButtonCheckedIcon fontSize="small" className={classes.layer} />
    </div>
  );
});
