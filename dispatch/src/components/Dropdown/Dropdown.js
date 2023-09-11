/* eslint-disable react/no-unused-class-component-methods */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-find-dom-node */
import { Children, isValidElement, cloneElement, Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import chainedFunction from '@root/helpers/chainedFunction';
import DropdownTrigger from './DropdownTrigger';
import DropdownContent from './DropdownContent';
import match from './matchComponent';

class Dropdown extends Component {
  static displayName = 'Dropdown';

  static propTypes = {
    disabled: PropTypes.bool,
    active: PropTypes.bool,
    isOpen: PropTypes.bool,
    role: PropTypes.string,
    onHide: PropTypes.func,
    onToggle: PropTypes.func,
    onShow: PropTypes.func,
    children: PropTypes.node,
    className: PropTypes.string,
    removeElement: PropTypes.bool,
    style: PropTypes.object,
  };

  static defaultProps = {
    className: '',
  };

  constructor(props) {
    super(props);

    this.state = {
      active: false,
    };

    this._onWindowClick = this._onWindowClick.bind(this);
    this._onToggleClick = this._onToggleClick.bind(this);
  }

  componentDidMount() {
    this.focusOnOpen();
    window.addEventListener('click', this._onWindowClick);
    window.addEventListener('touchstart', this._onWindowClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._onWindowClick);
    window.removeEventListener('touchstart', this._onWindowClick);
  }

  trigger = null;

  content = null;

  isDropdownTrigger = match(DropdownTrigger);

  isDropdownContent = match(DropdownContent);

  isActive() {
    return typeof this.props.active === 'boolean' ? this.props.active : this.state.active;
  }

  toggleDropdown(eventType) {
    const { isOpen, onToggle } = this.props;
    const shouldOpen = !isOpen;

    if (shouldOpen) {
      this.lastOpenEventType = eventType;
    }

    if (typeof onToggle === 'function') {
      onToggle(shouldOpen);
    }
  }

  focusOnOpen() {
    const { content } = this;

    if (this.lastOpenEventType === 'keydown' || this.props.role === 'menuitem') {
      // eslint-disable-next-line
      content.focusNext && content.focusNext();
      return;
    }

    if (this.lastOpenEventType === 'keyup') {
      // eslint-disable-next-line
      content.focusPrevious && content.focusPrevious();
    }
  }

  focus() {
    // eslint-disable-next-line react/no-find-dom-node
    const trigger = ReactDOM.findDOMNode(this.trigger);

    if (trigger && trigger.focus) {
      trigger.focus();
    }
  }

  hide() {
    this.setState(
      {
        active: false,
      },
      () => {
        if (this.props.onHide) {
          this.props.onHide();
        }
      },
    );
  }

  show() {
    this.setState(
      {
        active: true,
      },
      () => {
        if (this.props.onShow) {
          this.props.onShow();
        }
      },
    );
  }

  _onWindowClick(event) {
    const dropdownElement = ReactDOM.findDOMNode(this);
    if (
      event.target !== dropdownElement &&
      !dropdownElement.contains(event.target) &&
      this.isActive()
    ) {
      this.hide();
    }
  }

  _onToggleClick(event) {
    event.preventDefault();
    if (this.isActive()) {
      this.hide();
    } else {
      this.show();
    }
  }

  renderTrigger(child, props) {
    let ref = (c) => {
      this.trigger = c;
    };

    if (typeof child.ref === 'string') {
      // empty block
    } else {
      ref = chainedFunction(child.ref, ref);
    }

    return cloneElement(child, {
      ...props,
      ref,
      onClick: chainedFunction(child.props.onClick, this._onToggleClick),
      onKeyDown: chainedFunction(child.props.onKeyDown, this._onToggleClick),
    });
  }

  renderContent(child, { active, disabled, ...props }) {
    let ref = (c) => {
      this.content = c;
    };

    if (typeof child.ref === 'string') {
      // empty block
    } else {
      ref = chainedFunction(child.ref, ref);
    }

    return cloneElement(child, {
      ...props,
      ref,
      active,
      disabled,
    });
  }

  render() {
    const { children, className, disabled, removeElement } = this.props;
    // create component classes
    const active = this.isActive();
    const dropdownClasses = cx({
      dropdown: true,
      'dropdown--active': active,
      'dropdown--disabled': disabled,
    });

    // stick callback on trigger element
    const boundChildren = Children.map(children, (child) => {
      if (!isValidElement(child)) {
        return child;
      }

      if (this.isDropdownTrigger(child)) {
        return this.renderTrigger(child, {
          disabled,
          active,
        });
      }
      if (this.isDropdownContent(child) && removeElement && !active) {
        child = null;
      }

      if (this.isDropdownContent(child)) {
        return this.renderContent(child, {
          disabled,
        });
      }

      return child;
    });
    const cleanProps = { ...this.props };
    delete cleanProps.active;
    delete cleanProps.onShow;
    delete cleanProps.onHide;
    delete cleanProps.removeElement;

    return (
      <div {...cleanProps} className={`${dropdownClasses} ${className}`}>
        {boundChildren}
      </div>
    );
  }
}

export { DropdownTrigger, DropdownContent };
export default Dropdown;
