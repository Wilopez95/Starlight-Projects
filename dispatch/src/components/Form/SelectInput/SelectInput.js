/* eslint-disable react/prop-types */

import { Component } from 'react';
import Select from 'react-select';
import { Label } from '../Label';

// type Props = {
//   onChange: (string, string) => void,
//   onBlur: (string, boolean) => void,
//   name: string,
//   label: string,
//   options: Array<Object>,
//   isMulti?: boolean,
//   value: string,
//   touched?: boolean,
//   error?: string,
// };

export default class SelectInput extends Component {
  static defaultProps = {
    isMulti: false,
  };

  handleChange = (value) => {
    // this is going to call setFieldValue and manually update values.topcis
    this.props.onChange(this.props.name, value);
  };

  handleBlur = () => {
    // this is going to call setFieldTouched and manually update touched.topcis
    this.props.onBlur(this.props.name, true);
  };

  render() {
    return (
      <div>
        <Label htmlFor={this.props.name} label={this.props.label} />
        <Select
          id={this.props.name}
          options={this.props.options}
          multi={this.props.isMulti}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          value={this.props.value}
        />
        {Boolean(this.props.error) && this.props.touched ? (
          <div style={{ marginTop: '.5rem' }}>{this.props.error}</div>
        ) : null}
      </div>
    );
  }
}
