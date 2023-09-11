import { InputContainerSize } from '../../BaseInput/InputContainer/types';

export const validateOptions = (options: unknown[], footerExist: boolean) => {
  if (options.length === 0 && footerExist) {
    return [
      {
        value: null,
        label: '',
        fallbackForFooter: true,
      },
    ];
  }

  return options;
};

const containerSizes: Record<InputContainerSize, number> = {
  medium: 500,
  large: 700,
  normal: 300,
};

export const containerSizeToMenuHeight = (size: InputContainerSize = 'normal') => {
  return containerSizes[size];
};
