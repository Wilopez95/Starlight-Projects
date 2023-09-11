import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { exportCans } from '@root/state/modules/cans';
import ModalRoute from '@root/components/ModalRoute';
import FormExport from '@root/forms/Export';

const defaultState = (state) => ({
  filter: state.cans.filter,
});

class ExportCans extends PureComponent {
  static displayName = 'ExportCans';

  static propTypes = {
    filter: PropTypes.object,
    history: PropTypes.object,
  };

  static defaultProps = {
    filter: {},
  };

  close = () => {
    this.props.history.goBack();
  };

  exportCans = (filter) => exportCans(filter);

  render() {
    const { filter, history } = this.props;

    return (
      <ModalRoute title="Export" history={history}>
        <FormExport
          filter={filter}
          fileName="cans-export"
          onSubmit={this.exportCans}
          onDismiss={this.close}
        />
      </ModalRoute>
    );
  }
}

export default connect(defaultState)(ExportCans);
