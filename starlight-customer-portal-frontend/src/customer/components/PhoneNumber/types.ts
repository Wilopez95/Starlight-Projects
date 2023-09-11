import { FormikErrors } from 'formik';

import { IPhoneNumber } from '@root/core/types';

export interface IPhoneNumberComponent {
  index: number;
  phoneNumber: Omit<IPhoneNumber, 'id'>;
  parentFieldName: string;
  errors: FormikErrors<Omit<IPhoneNumber, 'id'>[]>;
  firstNumberEnabled?: boolean;
  firstNumberRemovable?: boolean;
  showTextOnly?: boolean;
  errorsDuplicate?: string;
  onRemove(index: number): void;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
  onNumberChange(name: string, value: unknown): void;
}

export interface IAddPhoneNumberComponent {
  index: number;
  push(phoneNumber: IPhoneNumber): void;
}
