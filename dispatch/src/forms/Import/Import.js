/* eslint-disable react/no-array-index-key */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';

import FormError from '../elements/form-error';

const initialState = {
  disabled: true,
  error: false,
  data: {
    csv: null,
    type: 'APPEND',
  },
};

class Import extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    onSubmit: PropTypes.func,
    onSuccessSubmit: PropTypes.func,
    onDismiss: PropTypes.func,
    linkToExample: PropTypes.string,
  };

  static defaultProps = {
    onSubmit: () => {},
    onSuccessSubmit: () => {},
    onDismiss: () => {},
  };

  constructor(props) {
    super(props);

    this.types = ['APPEND', 'UPDATE', 'DELETE'];
    this.state = initialState;

    this.reader = new FileReader();
    this.onSubmit = this.onSubmit.bind(this);
  }

  async onSubmit(event) {
    event.preventDefault();

    const { onSubmit, onSuccessSubmit, dispatch } = this.props;
    const { csv, type } = this.state.data;
    const isValid = csv && type;

    if (isValid) {
      this.setState({ disabled: true });

      try {
        await dispatch(onSubmit(type, csv));
        this.resetForm();
        onSuccessSubmit();
      } catch (error) {
        this.setState({ error });
      }
    } else {
      this.setState({
        disabled: true,
        error: {
          message: 'Please select csv file and operation type',
        },
      });
    }
  }

  onSelectType(type) {
    this.setState((prevState) => ({
      data: { ...prevState.data, type },
    }));
  }

  onSelectFile = (event) => {
    const file = event.target.files[0];

    if (file) {
      this.reader.onload = () =>
        this.setState((prevState) => ({
          error: false,
          disabled: false,
          data: { ...prevState.data, csv: this.reader.result },
        }));
      this.reader.readAsText(file);
    }
  };

  onDismiss = () => {
    this.resetForm();
    this.props.onDismiss();
  };

  resetForm() {
    this.form.reset();
    this.setState(initialState);
  }

  render() {
    return (
      <form
        ref={(it) => (this.form = it)}
        action="import/"
        className="form form--import"
        onSubmit={this.onSubmit}
      >
        {this.state.error ? <FormError error={this.state.error} /> : null}
        <div className="form-row">
          <label htmlFor="f-import" className="form-label">
            Csv file
          </label>
          <input id="f-import" accept=".csv" type="file" name="file" onChange={this.onSelectFile} />
        </div>
        <div className="form-row">
          <div className="btn-group">
            {this.types.map((item, key) => (
              <button
                key={key}
                type="button"
                onClick={(event) => {
                  this.onSelectType(item);
                  event.preventDefault();
                }}
                className={cx('btn btn__primary', {
                  'is-active': item === this.state.data.type,
                })}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <footer className="form-footer">
          {this.props.linkToExample ? (
            <div className="form-helper">
              <p>
                To view format, <Link to={this.props.linkToExample}>download CSV file</Link> from
                export
              </p>
            </div>
          ) : null}
          <div className="form-actions">
            <button className="button button__empty mr-2" type="button" onClick={this.onDismiss}>
              Cancel
            </button>
            <button type="submit" className="button button__primary" disabled={this.state.disabled}>
              Upload
            </button>
          </div>
        </footer>
      </form>
    );
  }
}
export default connect()(Import);
