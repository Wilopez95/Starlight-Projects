import PropTypes from 'prop-types';
import cn from 'classnames';

const defaultProps = {
  onClose: () => {},
};

const propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
  onClose: PropTypes.func,
  history: PropTypes.object,
};

function ModalRoute(props) {
  const close = (e) => {
    e.stopPropagation();
    if (props.history) {
      props.history.goBack();
    }
    props.onClose();
  };
  const { className, title, children } = props;
  return (
    <div className={cn('router-popup', className)}>
      <div className="router-popup--inner">
        <header className="router-popup--header">
          <h2 className="router-popup--title">{title}</h2>
        </header>
        <div className="router-popup--body">{children}</div>
        {props.history ? (
          <button className="router-popup--close" type="button" onClick={close} />
        ) : null}
      </div>
    </div>
  );
}

ModalRoute.defaultProps = defaultProps;
ModalRoute.propTypes = propTypes;

export default ModalRoute;
