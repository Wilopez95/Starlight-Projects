import PropTypes from 'prop-types';
import classNames from 'classnames';

export const FormRow = (props) => {
  const classes = classNames('form-row', {
    [`form-row--${props.name}`]: props.name,
  });

  return <div className={classes}>{props.children}</div>;
};

FormRow.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array.isRequired, PropTypes.object.isRequired]),
  name: PropTypes.string,
};

export const FormCol = (props) => {
  const classes = classNames('form-col', {
    [`form-col--${props.name}`]: props.name,
  });

  return <div className={classes}>{props.children}</div>;
};

FormCol.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array.isRequired, PropTypes.object.isRequired]),
  name: PropTypes.string,
};

export const FormBody = (props) => {
  const classes = classNames('form-body', {
    [`form-body--${props.name}`]: props.name,
  });

  return <div className={classes}>{props.children}</div>;
};

FormBody.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array.isRequired, PropTypes.object.isRequired]),
  name: PropTypes.string,
};
