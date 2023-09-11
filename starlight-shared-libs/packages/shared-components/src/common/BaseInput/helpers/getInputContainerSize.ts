import { InputContainerSize } from '../InputContainer/types';

export const getInputContainerSize = (size: InputContainerSize = 'normal'): string => {
  let valueSize = '38px';

  if (size === 'medium') {
    valueSize = '48px';
  } else if (size === 'large') {
    valueSize = '58px';
  }

  return valueSize;
};
