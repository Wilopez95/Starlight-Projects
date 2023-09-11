import React from 'react';
import InputMask from 'react-input-mask';
import { ITextInput } from '@starlightpro/shared-components';

import { FormInput } from '../FormInput/FormInput';

import { IMaskedTextInput } from './types';

export const MaskedTextInput: React.FC<IMaskedTextInput> = props => {
  const value = props.value ?? undefined;

  return (
    <InputMask {...props} value={value}>
      {(inputProps: ITextInput) => <FormInput {...inputProps} />}
    </InputMask>
  );
};
