import PropTypes from 'prop-types';
import cn from 'classnames';

const Page = (props) => {
  const classes = cn('page', {
    [`page--${props.name}`]: props.name,
  });

  return <div className={classes}>{props.children}</div>;
};

Page.propTypes = {
  name: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

export default Page;
