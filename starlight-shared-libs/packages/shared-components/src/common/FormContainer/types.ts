import { FormikContextType } from 'formik';

export interface IFormContainer {
  formik: FormikContextType<any>;
  noValidate?: boolean;
  className?: string;
  fullHeight?: boolean;
}

export interface IForm<T> {
  onSubmit(values: T): void;
  onClose(values?: T): void;
}
