import { FormikErrors } from 'formik';

export interface IInputContainer {
  children: React.ReactNode;
  className?: string;
  id?: string;
  label?: React.ReactNode;
  error?: string | false | string[] | FormikErrors<any>;
  size?: InputContainerSize;
  noErrorMessage?: boolean;
  disabled?: boolean;
  center?: boolean;
  inputRef?: React.MutableRefObject<HTMLDivElement | null>;
}

export interface IStyledInputLayoutContainer {
  disabled?: boolean;
}

export type InputContainerSize = 'medium' | 'large' | 'normal';
