import PropTypes from 'prop-types';

const Main = (props) => <main className="page-main">{props.children}</main>;
Main.propTypes = {
  children: PropTypes.object,
};

export default Main;
