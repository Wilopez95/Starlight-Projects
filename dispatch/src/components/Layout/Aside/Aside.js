import PropTypes from 'prop-types';

const Aside = ({ children }) => <aside className="page-aside">{children}</aside>;

Aside.propTypes = {
  children: PropTypes.array,
};

export default Aside;
