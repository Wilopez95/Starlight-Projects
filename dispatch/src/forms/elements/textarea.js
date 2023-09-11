import PropTypes from 'prop-types';
import { Component } from 'react';
import classNames from 'classnames';

class TextArea extends Component {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    setValue: PropTypes.func,
    isPristine: PropTypes.bool,
    showRequired: PropTypes.bool,
    value: PropTypes.bool,
    getErrorMessage: PropTypes.bool,
  };

  changeValue = (event) => {
    this.props.setValue(event.currentTarget.value);
  };

  render() {
    const classes = classNames('textarea', {
      'error-required': !this.props.isPristine && this.props.showRequired,
    });

    const { id, name } = this.props;

    return (
      <div className="control">
        <input
          id={id}
          name={name}
          type="textarea"
          className={classes}
          onChange={this.changeValue}
          value={this.props.value}
        />
        <span>{this.props.getErrorMessage}</span>
      </div>
    );
  }
}

export default TextArea;
