/* eslint-disable react/no-unused-prop-types, react/no-array-index-key */
import PropTypes from 'prop-types';

const LoginFormError = (props) => {
  const {
    error: { message, errors },
  } = props;

  // update the errors to more be more user friendly
  let newMessage;
  if (message === 'Request failed with status code 400') {
    newMessage = 'Bad Request. Please check your email and password and try again.';
  }
  if (message === 'Request failed with status code 401') {
    newMessage = 'Please check your email and password and try again.';
  }
  if (message === 'Request failed with status code 403') {
    newMessage = 'You do not have the correct permissions to view this. Please contact your admin.';
  }
  if (message === 'Request failed with status code 503') {
    newMessage = 'We seem to be having issues. Please try again later.';
  }

  return (
    <div className="form-error">
      <h5 data-name="error-message">{newMessage}</h5>
      {errors && errors.length ? (
        <ul data-name="error-list">
          {errors.map(({ param, msg }, key) => (
            <li key={key}>
              {param}: {msg}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

LoginFormError.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
    errors: PropTypes.arrayOf(
      PropTypes.shape({
        msg: PropTypes.string.isRequired,
        param: PropTypes.string.isRequired,
      }),
    ),
  }),
};

export default LoginFormError;
