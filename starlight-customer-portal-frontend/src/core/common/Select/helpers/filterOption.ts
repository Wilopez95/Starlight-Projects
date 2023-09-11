import { ISelectOption } from '../types';

export const filterOption = (option: ISelectOption, input: string) => {
  if (!input) {
    return true;
  }

  const normalizedLabel = option.label.toLowerCase();
  const normalizedInput = input.toLowerCase();

  return normalizedLabel.includes(normalizedInput);
};

export const filterExactOption = (option: ISelectOption, input: string) => {
  if (!input) {
    return true;
  }

  const normalizedLabel = option.label.toLowerCase();
  const normalizedInput = input.toLowerCase();

  return normalizedLabel.startsWith(normalizedInput);
};
