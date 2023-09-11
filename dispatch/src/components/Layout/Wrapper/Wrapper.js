import PropTypes from 'prop-types';

const Wrapper = (props) => <div className="wrapper">{props.children}</div>;

Wrapper.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

export default Wrapper;
