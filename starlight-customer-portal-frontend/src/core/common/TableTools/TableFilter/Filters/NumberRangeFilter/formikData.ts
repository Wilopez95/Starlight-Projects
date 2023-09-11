import * as Yup from 'yup';

export const getInitialValues = (fromKey: string, toKey: string) => ({
  [fromKey]: 0,
  [toKey]: 0,
});

export const generateValidationSchema = (fromKey: string, toKey: string) =>
  Yup.object().shape({
    [fromKey]: Yup.number().typeError('').required(),
    [toKey]: Yup.number().typeError('').integer().moreThan(Yup.ref(fromKey)).required(),
  });
