import * as Yup from 'yup';

import { emailValidator } from '@root/helpers';

export const validationSchema = Yup.object().shape({
  statementsEmails: Yup.array()
    .of(Yup.string().email(emailValidator))
    .min(1, 'Emails are required')
    .max(5, 'Email quantity should not be greater than 5'),
});
