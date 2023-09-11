import React, { FC } from 'react';
import MuiRadio, { RadioProps } from '@material-ui/core/Radio';
import { RadioButtonIcon } from './RadioButtonIcon';

export const Radio: FC<RadioProps> = (props) => {
  return (
    <MuiRadio
      {...props}
      size="small"
      tabIndex={-1}
      icon={<RadioButtonIcon disabled={props.disabled} />}
      checkedIcon={<RadioButtonIcon checked disabled={props.disabled} />}
    />
  );
};
