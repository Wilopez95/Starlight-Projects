import * as Yup from 'yup';

import { type FormikLinkJobSite } from './types';

export const validationSchema = Yup.object().shape({
  searchString: Yup.string(),
  jobSiteId: Yup.number().required('Job Site is required'),
});

export const defaultValue: FormikLinkJobSite = {
  searchString: '',
  jobSiteId: undefined,
};
