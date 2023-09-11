/* eslint-disable react/no-unused-prop-types, react/no-array-index-key */
import PropTypes from 'prop-types';

const FormError = (props) => {
  const {
    error: { message, errors },
  } = props;

  return (
    <div className="form-error">
      <h5 data-name="error-message">{message}</h5>
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

FormError.propTypes = {
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

export default FormError;
