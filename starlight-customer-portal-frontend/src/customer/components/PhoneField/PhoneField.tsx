import React, { useCallback } from 'react';
import { FormInput, ITextInput } from '@starlightpro/shared-components';

import { useRegionConfig } from '@root/core/hooks';

const PhoneField: React.FC<ITextInput> = ({ onChange, ...props }) => {
  const { formatPhoneNumber } = useRegionConfig();
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { value, name } = e.target;
      const formatted = formatPhoneNumber(value);

      if (formatted) {
        const newEvent = { ...e, target: { ...e.target, name, value: formatted } };

        onChange(newEvent);
      }
    },
    [formatPhoneNumber, onChange],
  );

  return <FormInput {...{ ...props, onChange, onBlur: handleBlur }} />;
};

export default PhoneField;
