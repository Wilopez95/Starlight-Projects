import ApplicationError from '../errors/ApplicationError.js';

const validate = ({ schema, params }) => {
  const result = schema.validate(params);

  if (result.error) {
    throw ApplicationError.invalidRequest(undefined, result.error.details);
  }

  return result.value;
};

export default validate;
