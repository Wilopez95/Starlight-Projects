import * as yup from 'yup';

export const TaxExemptionRow = yup.object({
  auth: yup
    .string()
    .when('selected', {
      is: true,
      then: yup.string().required('Required'),
    })
    .max(100, 'Should be less then 100 characters'),
});
