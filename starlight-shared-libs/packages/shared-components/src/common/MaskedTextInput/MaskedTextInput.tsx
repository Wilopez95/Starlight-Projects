import React from 'react';
import InputMask from 'react-input-mask';

import { FormInput } from '../FormInput/FormInput';
import { ITextInput } from '../TextInput/types';

import { IMaskedTextInput } from './types';

export const MaskedTextInput: React.FC<IMaskedTextInput> = props => {
  const value = props.value !== null ? props.value : undefined;

  return (
    <InputMask {...props} value={value}>
      {(inputProps: ITextInput) => <FormInput {...inputProps} />}
    </InputMask>
  );
};
