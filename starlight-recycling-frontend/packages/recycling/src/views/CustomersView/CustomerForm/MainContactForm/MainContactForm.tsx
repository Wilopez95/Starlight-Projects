import React, { FC } from 'react';
import * as yup from 'yup';

import ContactForm from '../../../CustomerContacts/CustomerContactForm/ContactForm';
import { contactSchema } from '../../../CustomerContacts/CustomerContactForm/CustomerContactForm';
import { RegionConfig } from '../../../../i18n/region';

export const mainContactSchema = (regionConfig: RegionConfig) =>
  yup.object().shape({
    mainContact: contactSchema(regionConfig),
  });

export interface MainContactFormProps {}

const fieldNameMapping = {
  firstName: 'mainContact.firstName',
  lastName: 'mainContact.lastName',
  email: 'mainContact.email',
  phones: 'mainContact.phones',
  title: 'mainContact.title',
};

export const MainContactForm: FC<MainContactFormProps> = () => {
  return <ContactForm fieldNameMapping={fieldNameMapping} />;
};

export default MainContactForm;
