import PropTypes from 'prop-types';
import cx from 'classnames';
import { connect } from 'formik';
import './styles.scss';

export const Form = ({ formik, children, className, ...rest }) => (
  <form
    className={cx('sui-form sui-form-wrapper', className)}
    onSubmit={formik.handleSubmit}
    {...rest}
  >
    {children}
  </form>
);

Form.propTypes = {
  formik: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Form.defaultProps = {
  className: null,
};

export default connect(Form);
