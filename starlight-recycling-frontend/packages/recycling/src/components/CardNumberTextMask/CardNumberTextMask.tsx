import React, { FC, useEffect, useState } from 'react';
import MaskedInput, { MaskedInputProps } from 'react-text-mask';

export const defaultCardMask = [
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  ' ',
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  ' ',
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  ' ',
  /\d/,
  /\d/,
  /\d/,
  /\d/,
];

export const cardPrefixes15 = ['34', '37', '2131', '1800'];
export const cardPrefixes14 = ['300', '301', '302', '303', '304', '305', '36', '38'];

export interface CardNumberTextMaskProps extends MaskedInputProps {
  inputRef: (ref: HTMLInputElement | null) => void;
}

export const CardNumberTextMask: FC<CardNumberTextMaskProps> = (props) => {
  const { inputRef, value, ...other } = props;
  const [currentMask, setCurrentMask] = useState(defaultCardMask);

  useEffect(() => {
    if (!value || typeof value !== 'string') {
      setCurrentMask(defaultCardMask);

      return;
    }

    if (cardPrefixes15.some((prefix) => value.startsWith(prefix))) {
      setCurrentMask(defaultCardMask.slice(0, -1));
    } else if (cardPrefixes14.some((prefix) => value.startsWith(prefix))) {
      setCurrentMask(defaultCardMask.slice(0, -2));
    } else {
      setCurrentMask(defaultCardMask);
    }
  }, [value]);

  return (
    <MaskedInput
      {...other}
      value={value}
      ref={(ref: any) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={currentMask}
      placeholderChar={'\u2000'}
    />
  );
};

export default CardNumberTextMask;
