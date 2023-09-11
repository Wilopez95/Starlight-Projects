import PropTypes from 'prop-types';

const Label = (props) => {
  const forAttr = `f-${props.htmlFor}`;

  return (
    <label className="form-label" htmlFor={forAttr}>
      {props.children}
    </label>
  );
};

Label.propTypes = {
  children: PropTypes.string.isRequired,
  htmlFor: PropTypes.string,
};

export default Label;
