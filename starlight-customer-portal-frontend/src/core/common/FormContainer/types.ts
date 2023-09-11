import { FormikContextType } from 'formik';

export interface IFormContainer {
  formik: FormikContextType<any>;
  noValidate?: boolean;
  className?: string;
  fullHeight?: boolean;
}
