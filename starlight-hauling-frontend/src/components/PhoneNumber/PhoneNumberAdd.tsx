import React, { useCallback } from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Typography } from '@root/common';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';

import { homePhoneNumber, mainPhoneNumber } from './defaults';
import { IAddPhoneNumberComponent } from './types';

const PhoneNumberAdd: React.FC<IAddPhoneNumberComponent> = ({ push, index }) => {
  const onClick = useCallback(() => {
    push(index > 0 ? homePhoneNumber : mainPhoneNumber);
  }, [index, push]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onClick();
      }
    },
    [onClick],
  );

  return (
    <Layouts.Flex alignItems="center" justifyContent="space-between">
      <Typography
        role="button"
        color="information"
        variant="bodyMedium"
        cursor="pointer"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
      >
        + Add phone number
      </Typography>
    </Layouts.Flex>
  );
};

export default PhoneNumberAdd;
