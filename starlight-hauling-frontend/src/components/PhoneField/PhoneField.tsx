import React, { useCallback } from 'react';
import { type ITextInput } from '@starlightpro/shared-components';

import { FormInput } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';

const PhoneField: React.FC<ITextInput> = ({ onChange, ...props }) => {
  const { formatPhoneNumber } = useIntl();
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
  const placeholder = 'XXX-XXX-XXXX';

  return <FormInput {...{ ...props, onChange, onBlur: handleBlur, placeholder }} />;
};

export default PhoneField;
