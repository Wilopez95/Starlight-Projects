import React, { FC } from 'react';
import MaskedInput from 'react-text-mask';

export interface QuantityTextMaskProps {
  inputRef: (ref: HTMLInputElement | null) => void;
}

export const QuantityTextMask: FC<any> = (props) => {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={(ref: any) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[/\d/, /\d/, /\d/, /\d/, /\d/]}
      guide={false}
    />
  );
};

export default QuantityTextMask;
