import PropTypes from 'prop-types';

const FormSingleError = ({ error }) => (
  <div className="form-error">
    <h5 data-name="error-message">{error}</h5>
  </div>
);

FormSingleError.propTypes = {
  error: PropTypes.string.isRequired,
};
export default FormSingleError;
