import { IForm } from '@starlightpro/shared-components';

import { IContact } from '@root/core/types';
import { IFormModal } from '@root/core/widgets/modals/types';

export interface IContactFormData extends IContact {
  temporaryContact?: boolean;
}

export interface INewContact extends IForm<IContactFormData> {
  contact: IContactFormData | null;
}

export interface IEditProfileModal extends IFormModal<IContactFormData> {
  contact: IContactFormData | null;
}
