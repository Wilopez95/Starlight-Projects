import { ReactNode } from 'react';

export interface IBaseInput<V, E = string> {
  name: string;
  id?: string;
  ariaLabel?: string;
  value?: V;
  label?: ReactNode;

  error?: E;
  noError?: boolean;
  borderError?: boolean;

  disabled?: boolean;
  readOnly?: boolean;

  className?: string;
  wrapperClassName?: string;
}
