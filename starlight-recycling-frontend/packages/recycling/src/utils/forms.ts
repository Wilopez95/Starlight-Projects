import { ObjectSchema } from 'yup';
import { setIn } from 'final-form';

interface IError {
  path: string;
  message: string;
}

export const validate = async (values: {}, schema: ObjectSchema) => {
  try {
    await schema.validate(values, { abortEarly: false });
  } catch (e) {
    if (!e.inner) {
      console.error(e); // eslint-disable-line no-console
    }

    return e.inner.reduce((formError: [], innerError: IError) => {
      return setIn(formError, innerError.path, innerError.message);
    }, {});
  }
};

// To be passed to React Final Form
export const validateFormValues = (schema: any) => async (values: any) => {
  if (typeof schema === 'function') {
    schema = schema();
  }

  return validate(values, schema);
};
