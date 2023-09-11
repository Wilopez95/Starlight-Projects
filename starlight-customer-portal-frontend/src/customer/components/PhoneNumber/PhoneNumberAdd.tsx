import React, { useCallback } from 'react';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { homePhoneNumber, mainPhoneNumber } from './defaults';
import { IAddPhoneNumberComponent } from './types';

const PhoneNumberAdd: React.FC<IAddPhoneNumberComponent> = ({ push, index }) => {
  const onClick = useCallback(() => {
    push(index > 0 ? homePhoneNumber : mainPhoneNumber);
  }, [index, push]);

  return (
    <Layouts.Flex alignItems='center' justifyContent='space-between'>
      <Typography color='information' variant='bodyMedium' cursor='pointer' onClick={onClick}>
        + Add phone number
      </Typography>
    </Layouts.Flex>
  );
};

export default PhoneNumberAdd;
