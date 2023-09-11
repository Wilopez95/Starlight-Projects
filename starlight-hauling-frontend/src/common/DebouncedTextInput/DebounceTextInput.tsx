import React, { useCallback } from 'react';
import { TextInput, TextInputElement } from '@starlightpro/shared-components';
import { useDebouncedCallback } from 'use-debounce';

import { FormInput } from '../FormInput/FormInput';

import { IDebouncedTextInput } from './types';

export const DebouncedTextInput: React.FC<IDebouncedTextInput> = ({
  onDebounceChange,
  debounceTime = 300,
  noContext,
  onChange,
  ...props
}) => {
  const [handleDebounce] = useDebouncedCallback(onDebounceChange, debounceTime);

  const handleChange = useCallback(
    (e: React.ChangeEvent<TextInputElement>) => {
      handleDebounce(e.target.value);
      onChange(e);
    },
    [handleDebounce, onChange],
  );

  const Component = noContext ? TextInput : FormInput;

  return <Component {...props} onChange={handleChange} />;
};
