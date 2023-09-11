import PropTypes from 'prop-types';
import { PureComponent } from 'react';

class TimePicker extends PureComponent {
  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    getErrorMessage: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
  };

  render() {
    return (
      <div className="control">
        <input
          disabled={this.props.disabled}
          name={this.props.name}
          type="time"
          className="time-input"
          placeholder={this.props.placeholder}
          onChange={(event) => {
            event.preventDefault();
            this.props.onChange(event.target.value);
          }}
          value={this.props.value}
        />
        <span>{this.props.getErrorMessage}</span>
      </div>
    );
  }
}

export default TimePicker;
