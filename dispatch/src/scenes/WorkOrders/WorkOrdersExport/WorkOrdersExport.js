import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { exportWorkOrders } from '@root/state/modules/workOrders';
import ModalRoute from '@root/components/ModalRoute';
import FormExport from '@root/forms/Export';

const defaultState = (state) => ({
  filter: state.workOrders.filter,
});

class WorkOrdersExport extends Component {
  static propTypes = {
    filter: PropTypes.object,
    history: PropTypes.object,
  };

  static defaultProps = {
    filter: {},
  };

  close = () => {
    this.props.history.go(-1);
  };

  exportWorkOrders = (filter) => exportWorkOrders(filter);

  render() {
    const { filter, history } = this.props;
    return (
      <ModalRoute title="Export" history={history}>
        <FormExport
          filter={filter}
          fileName="work-orders-export"
          onSubmit={this.exportWorkOrders}
          onDismiss={this.close}
          history={history}
        />
      </ModalRoute>
    );
  }
}

export default connect(defaultState)(WorkOrdersExport);
