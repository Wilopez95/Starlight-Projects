/* eslint-disable react/prop-types */
import { PureComponent } from 'react';
import classNames from 'classnames';

// export type Props = {
//   name: string,
//   getErrorMessage?: () => void,
//   onChange: string => void,
//   isPristine?: boolean,
//   showRequired?: boolean,
//   placeholder?: string,
//   value?: string,
// };

class SearchInput extends PureComponent {
  onChange = (e) => {
    this.props.onChange(e.target.value);
  };

  render() {
    const classes = classNames('search-input', {
      'error-required': !this.props.isPristine && this.props.showRequired,
    });

    return (
      <div className="control">
        <span className="search-icon">{this.props.getErrorMessage}</span>
        <input
          id={`f-${this.props.name}`}
          type="text"
          className={classes}
          placeholder={this.props.placeholder}
          onChange={this.onChange}
          value={this.props.value}
          style={{ color: this.props.value.length ? '#434343' : '#dcdcdc' }}
        />
      </div>
    );
  }
}

export default SearchInput;
