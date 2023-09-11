/* eslint-disable jsx-a11y/anchor-is-valid */
import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

class DropdownTrigger extends PureComponent {
  static displayName = 'DropdownTrigger';

  static propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    // eslint-disable-next-line
    componentType: PropTypes.any,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: '',
    componentType: DropdownTrigger,
  };

  render() {
    const { children, className } = this.props;
    const classes = cn('dropdown__trigger', {
      className,
    });

    return (
      <a onClick={this.props.onClick} onKeyDown={this.props.onClick} className={classes}>
        {children}
      </a>
    );
  }
}

export default DropdownTrigger;
