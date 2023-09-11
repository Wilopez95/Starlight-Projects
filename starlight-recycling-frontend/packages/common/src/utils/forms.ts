import { ObjectSchema } from 'yup';
import { get, isEmpty } from 'lodash-es';
import { setIn, FORM_ERROR, FormApi, SubmissionErrors } from 'final-form';
import createDecorator from 'final-form-calculate';

interface IError {
  path: string;
  message: string;
}

export const validateFormValues = async (values: {}, schema: ObjectSchema) => {
  try {
    await schema.validate(values, { abortEarly: false });
  } catch (e) {
    return e.inner.reduce((formError: [], innerError: IError) => {
      return setIn(formError, innerError.path, innerError.message);
    }, {});
  }
};

// To be passed to React Final Form
export const validateSchema = (schema: any) => async (values: any) => {
  if (typeof schema === 'function') {
    schema = schema();
  }

  return validateFormValues(values, schema);
};

export const onSubmitWithErrorHandling = <T>(
  onSubmit: (
    values: T,
    form: FormApi<T, Partial<T>>,
  ) => Promise<SubmissionErrors | boolean | undefined | void> | void | SubmissionErrors | undefined,
  onSubmitted?: (values: T) => Promise<void>,
) => async (values: T, form: FormApi<T, Partial<T>>): Promise<any> => {
  try {
    const result = await onSubmit(values, form);

    if (result === false) {
      // submit is not final
      return;
    }

    form.initialize(values);

    if (onSubmitted) {
      await onSubmitted(values);
    }
  } catch (e) {
    const formErrors: any = {};
    let errors = e.graphQLErrors;

    if (isEmpty(errors)) {
      const networkError = e.networkError;

      const result = networkError?.result;

      if (result && !isEmpty(result.errors)) {
        errors = result.errors;
      }
    }

    if (errors) {
      const formErrorList: string[] = [];

      errors.forEach((e: any) => {
        const message = e.message;

        if (message === 'Argument Validation Error') {
          const validationErrors = get(e, 'extensions.exception.validationErrors');

          if (validationErrors) {
            validationErrors.forEach((validationError: any) => {
              formErrors[validationError.property] = Object.values(
                validationError.constraints,
              ).join(', ');
            });
          }
        } else {
          formErrorList.push(message);
        }
      });

      if (formErrorList.length > 0) {
        formErrors[FORM_ERROR] = formErrorList.join(',\n');
      }
    } else {
      formErrors[FORM_ERROR] = e.message;
    }

    return formErrors;
  }
};

export const numericCheckNaNDecorator = (field: string) =>
  createDecorator({
    field,
    updates: {
      [field]: (value) => (isNaN(value) ? null : value),
    },
  });
