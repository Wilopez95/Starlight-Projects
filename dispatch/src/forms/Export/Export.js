// Libs
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';
import { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// Forms
import FormError from '../elements/form-error';

const emptyState = {
  error: false,
  submitting: false,
  exportWithFilter: true,
};

class Export extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    onSubmit: PropTypes.func.isRequired,
    onSuccessSubmit: PropTypes.func,
    filter: PropTypes.object,
    fileName: PropTypes.string,
    history: PropTypes.any,
  };

  static defaultProps = {
    onSuccessSubmit: () => {},
    fileName: 'export',
    filter: {},
  };

  constructor(props) {
    super(props);
    /* istanbul ignore next */
    this.state = emptyState;
    this.onSubmit = this.onSubmit.bind(this);
  }

  handleDismiss = () => {
    this.props.history.goBack();
  };

  async onSubmit(event) {
    event.preventDefault();
    this.setState({ submitting: true, error: false });

    try {
      const { dispatch, onSubmit, onSuccessSubmit } = this.props;
      const withFilter = this.state.exportWithFilter;
      const filter = withFilter ? this.props.filter : {};
      const startDate = filter && filter.date && filter.date.startDate;
      const endDate = filter && filter.date && filter.date.endDate;

      const fileName = [
        this.props.fileName,
        withFilter ? 'filtered' : 'full',
        ...(withFilter && startDate && endDate
          ? [
              'from',
              moment(filter.date.startDate).format('MM-DD-YYYY'),
              'to',
              moment(filter.date.endDate).format('MM-DD-YYYY'),
            ]
          : [moment().format('MM-DD-YYYY')]),
      ].join('-');

      const newFilter = {
        ...filter,
        ...(startDate && endDate
          ? {
              date: `${moment(startDate).format('YYYY-MM-DD')}..${moment(endDate).format(
                'YYYY-MM-DD',
              )}`,
            }
          : { date: '' }),
      };

      const response = await dispatch(onSubmit(newFilter));
      const blob = new Blob([response.data], { type: 'text/csv' });
      const href = window.URL.createObjectURL(blob);
      this.download(href, fileName);
      this.resetForm();
      onSuccessSubmit();
    } catch (error) {
      this.setState({ error, submitting: false });
    }
  }

  resetForm() {
    this.setState(emptyState);
  }

  // need to replace all # with no on download to stop the break
  download(file, fileName) {
    const link = document.createElement('a');
    link.setAttribute('href', file);
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  render() {
    return (
      <form action="export/" className="form form--export" onSubmit={this.onSubmit}>
        {this.state.error ? <FormError error={this.state.error} /> : null}
        <div className="form-row">
          <label htmlFor="f-type" className="form-label">
            Select the export option
          </label>
          <button
            type="button"
            onClick={() => this.setState({ exportWithFilter: true })}
            className="button button__primary btn__lg"
          >
            CURRENT
          </button>
        </div>
        <footer className="form-footer">
          <div className="form-actions">
            <button
              className="button button__empty mr-2"
              type="button"
              onClick={this.handleDismiss}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button__primary"
              disabled={this.state.submitting}
            >
              Download
            </button>
          </div>
        </footer>
      </form>
    );
  }
}

export default withRouter(connect()(Export));
