import { PureComponent } from 'react';
import PropTypes from 'prop-types';

class DropdownContent extends PureComponent {
  static displayName = 'DropdownContent';

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: '',
  };

  render() {
    const { children, className, ...dropdownContentProps } = this.props;
    dropdownContentProps.className = `dropdown__content ${className}`;

    return <div {...dropdownContentProps}>{children}</div>;
  }
}

export default DropdownContent;
