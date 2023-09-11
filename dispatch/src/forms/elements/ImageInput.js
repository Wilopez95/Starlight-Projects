/* eslint-disable react/no-find-dom-node */
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactDOM from 'react-dom';

class ImageInput extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    multiple: PropTypes.bool,
    setValue: PropTypes.func,
    value: PropTypes.string,
  };

  static defaultProps = {
    name: '',
    multiple: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      label: null,
    };
  }

  onChange = () => {
    const { files } = this.fileInput;
    const isEmptyInput = files.length === 0;

    if (!isEmptyInput) {
      const label = files.length > 1 ? `${files.length} files` : files[0].name;

      Object.keys(files).forEach((key) => {
        const file = files[key];

        this.readFile(file, (file) => this.saveFile(file));
      });
      this.setState({ label });
    }
  };

  readFile = (file, callback) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const {
        target: { result },
      } = event;

      callback(result);
    };

    reader.readAsDataURL(file);
  };

  saveFile = (file) => {
    let value;

    if (this.props.multiple) {
      const files = this.props.value || [];

      value = [...files, file];
    } else {
      value = file;
    }

    this.props.setValue('picture', value);
  };

  clearInput() {
    this.setState({ label: null });
  }

  triggerInput = () => {
    this.clearInput();
    ReactDOM.findDOMNode(this.fileInput).click();
  };

  render() {
    const { name, multiple } = this.props;

    return (
      <div className="image-input">
        <button
          className="btn btn__default"
          type="button"
          onClick={this.triggerInput}
          style={{ height: '34px' }}
        >
          Choose file
        </button>
        <p>{this.state.label || 'No file chosen'}</p>
        <input
          ref={(it) => (this.fileInput = it)}
          type="file"
          name={name}
          multiple={multiple}
          accept="image/jpeg,image/png,image/gif, .pdf, .webp"
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default ImageInput;
