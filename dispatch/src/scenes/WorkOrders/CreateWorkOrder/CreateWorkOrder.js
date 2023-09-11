/* eslint-disable react/prop-types */
/* eslint-disable react/no-unused-prop-types */

import { PureComponent } from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import { loadTemplates, selectTemplates } from '@root/state/modules/templates';
import ModalRoute from '@root/components/ModalRoute';
import FormCreateWorkOrder from '@root/forms/CreateWorkOrder/CreateWorkOrder';

// type WorkOrderParams = {
//   action: string,
//   workOrderId: number,
// };

// export type Props = {
//   user: Object,
//   params: WorkOrderParams,
//   routes: $ReadOnlyArray<Object>,
//   templates: Object,
//   dispatch: Function,
//   history: Object,
//   match: Object,
//   loadTemplates: Function,
//   workOrders: Object,
//   dispatcher: Object,
// };

export class CreateWorkOrder extends PureComponent {
  static displayName = 'CreateWorkOrder';

  componentDidMount() {
    this.props.loadTemplates();
  }

  close = () => {
    const event = new CustomEvent('forceEvent');
    window.dispatchEvent(event);
    this.props.history.goBack();
  };

  render() {
    const { history, match } = this.props;
    const classN = cn({
      page: !match.path.includes('map'),
      'page--workordersIndex': match.path.includes('map'),
      'page--dispatcher': match.path.includes('dispatcher'),
    });
    return (
      <div className={classN}>
        <ModalRoute
          title="Create Work Order"
          className="popup-work-order-actions--popup"
          history={history}
        >
          <FormCreateWorkOrder
            templates={this.props.templates}
            workOrders={this.props.workOrders.filtered}
            action="create"
            onDismiss={this.close}
            onSuccessSubmit={this.close}
            filter={
              match.path.includes('dispatcher')
                ? this.props.dispatcher.filter
                : this.props.workOrders.filter
            }
          />
        </ModalRoute>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  templates: selectTemplates(state),
  workOrders: state.workOrders,
  dispatcher: state.dispatcher,
});
export default connect(mapStateToProps, { loadTemplates })(CreateWorkOrder);
