import * as yup from 'yup';
import { validateSchema } from '@starlightpro/common';

const schema = yup.object({
  materialsDistribution: yup.array().of(
    yup.object({
      value: yup
        .number()
        .min(0, 'Minimum 0')
        .max(100, 'Too Long')
        .required('Required')
        .typeError('Required'),
    }),
  ),

  miscellaneousMaterialsDistribution: yup.array().of(
    yup.object({
      quantity: yup
        .number()
        .min(0, 'Minimum 0')
        .max(999999999, 'Too Long')
        .required('Required')
        .typeError('Required'),
    }),
  ),
  total: yup.number().equals([100], 'Total material amount has to be 100%'),
});

export default validateSchema(schema);
