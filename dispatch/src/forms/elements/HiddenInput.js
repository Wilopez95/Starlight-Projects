import PropTypes from 'prop-types';
import { Component } from 'react';

class HiddenInput extends Component {
  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
  };

  changeValue = (event) => {
    this.setValue(event.currentTarget.value);
  };

  render() {
    const { name } = this.props;
    return (
      <input
        type="hidden"
        name={name}
        value={this.props.value || undefined}
        onChange={this.changeValue}
      />
    );
  }
}

export default HiddenInput;
