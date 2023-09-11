import React, { FC } from 'react';
import MaskedInput from 'react-text-mask';
import { useRegion } from '../../hooks/useRegion';

export interface PhoneNumberTextMaskProps {
  inputRef: (ref: HTMLInputElement | null) => void;
}

export const PhoneNumberTextMask: FC<PhoneNumberTextMaskProps> = (props) => {
  const { inputRef, ...other } = props;
  const region = useRegion();

  return (
    <MaskedInput
      {...other}
      ref={(ref: any) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={region.phoneNumberTextMask}
    />
  );
};

export default PhoneNumberTextMask;
