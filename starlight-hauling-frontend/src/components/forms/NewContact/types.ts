import { IContact } from '@root/types';

export interface IContactFormData extends IContact {
  temporaryContact: boolean;
}
