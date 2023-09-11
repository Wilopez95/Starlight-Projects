import React, { FC } from 'react';
import TextField, { TextFieldProps } from '../TextField';
import LineTextFieldInput from '../../LineTextField';

export const LineTextField: FC<TextFieldProps> = (props) => {
  return <LineTextFieldInput {...props} TextField={TextField as any} />;
};

export default LineTextField;
