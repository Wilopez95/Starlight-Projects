/* eslint-disable react/prop-types */
import { PureComponent, memo } from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import { Tooltip } from 'react-tippy';
import { Link, withRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { Helmet } from 'react-helmet';
// Actions
import {
  fetchWorkOrders,
  filterChange,
  setActiveWorkOrder,
  removeWorkOrder,
} from '@root/state/modules/workOrders';
import { fetchConstantsIfNeeded } from '@root/state/modules/constants';
import { fetchSettingByKey } from '@root/state/modules/settings';
import { emptyWorkOrderFilter } from '@root/utils/emptyWorkOrderFilter';
import { labelAndValueExtractor } from '@root/helpers/functions';
import DataList from '@root/components/DataList';
import WorkOrder from '@root/components/WorkOrder';
// import type { WorkOrderType } from 'types/index';
import { Page, Aside, Main } from '@root/components/Layout';
import WorkOrdersMap from '@root/components/WorkOrdersMap';
import FilterForm from '@root/forms/WorkOrdersFilter';
import { pathToUrl } from '@root/helpers/pathToUrl';
import { Paths } from '@root/routes/routing';

// export type Props = {
//   workOrders: Array<WorkOrderType>,
//   active: boolean | WorkOrderType,
//   isLoading: boolean,
//   dispatch: Function,
//   filter?: Object,
//   routes?: $ReadOnlyArray<any>,
//   setting: Object,
//   constants: Object,
// };

class WorkOrdersHome extends PureComponent {
  static displayName = 'WorkOrdersHome';

  componentDidMount() {
    this.props.dispatch(fetchSettingByKey('map', this.props.match.params.businessUnit));
    this.props.dispatch(fetchConstantsIfNeeded());

    this.onFilterChange(emptyWorkOrderFilter);
  }

  workOrders = {};

  datalist = null;

  onFilterChange = (filter = {}) => {
    this.props.dispatch(filterChange({ ...this.props.filter, ...filter }));
    this.props.dispatch(
      fetchWorkOrders(
        {
          ...this.props.filter,
          ...filter,
          businessUnitId: this.props.match.params.businessUnit,
        },
        'workorders',
      ),
    );
  };

  onPointClick = (workOrder) => {
    Sentry.addBreadcrumb({
      category: 'ui',
      message: `Clicked marker for work order #"${workOrder.id}"`,
      level: 'info',
      type: 'user',
    });
    this.props.dispatch(setActiveWorkOrder(workOrder));
    this.scrollTo(workOrder.id);
  };

  handleClickDelete = (id) => {
    this.props.dispatch(removeWorkOrder(id));
  };

  scrollTo(id) {
    Sentry.addBreadcrumb({
      category: 'ui',
      message: `Scrolling to work order #"${id}"`,
      level: 'info',
      type: 'user',
    });
    // eslint-disable-next-line react/no-find-dom-node
    const workorderNode = ReactDOM.findDOMNode(this.workOrders[id]);
    workorderNode.scrollIntoView({ behavior: 'smooth' });
  }

  render() {
    const { workOrders, filter, routes, active, isLoading, setting, constants } = this.props;
    const sizes = constants.can.size.map(labelAndValueExtractor);
    const materials = constants.workOrder.material.map(labelAndValueExtractor);

    const actions = Object.keys(constants.workOrder.action).map((key) =>
      labelAndValueExtractor(constants.workOrder.action[key]),
    );
    const statuses = Object.keys(constants.workOrder.status).map((key) =>
      labelAndValueExtractor(constants.workOrder.status[key]),
    );
    const actionTypes = actions.map((act) => ({
      label: act.label === 'SPOT' ? 'DELIVERY' : act.label,
      value: act.value,
    }));

    return (
      <Page name="workordersIndex">
        <Helmet title="Work Orders" />
        <div className="page-inner">
          <Main>
            {setting && setting.data ? (
              <WorkOrdersMap
                activeWorkOrder={active}
                workOrders={workOrders}
                onBoundsChange={this.onFilterChange}
                onPointClick={this.onPointClick}
                setting={setting}
              />
            ) : null}
          </Main>
          <Aside>
            <header className="aside-header">
              <h1 className="aside-title">Work orders</h1>
              <div className="controls">
                <div className="controls-item">
                  <div className="btn-group">
                    <Link
                      className="btn btn__default btn__small"
                      to={{
                        pathname: pathToUrl(`${Paths.Work}/export`, {
                          businessUnit: this.props.match.params.businessUnit,
                        }),
                        state: { modal: true },
                      }}
                    >
                      <Tooltip
                        title="This option will export all, or just the filtered, workorders to a CSV file."
                        position="top"
                        trigger="mouseenter"
                      >
                        Export
                      </Tooltip>
                    </Link>
                  </div>
                </div>
              </div>
            </header>
            <div
              className={cx('filter filter--aside', {
                disabled: isLoading,
              })}
            >
              <Tooltip
                title="This option provides you with several ways to filter the way you see the workorders."
                position="top"
                trigger="mouseenter"
              >
                <FilterForm
                  onChange={this.onFilterChange}
                  statuses={statuses}
                  state={filter}
                  sizes={sizes}
                  materials={materials}
                  actions={actionTypes}
                />
              </Tooltip>
            </div>
            <DataList ref={(c) => (this.datalist = c)} loading={isLoading}>
              {workOrders.map((item) => (
                <WorkOrder
                  wrappedComponentRef={(c) => (this.workOrders[item.id] = c)}
                  key={item.id}
                  data={item}
                  active={item.id === active.id}
                  routes={routes}
                  onDelete={this.handleClickDelete}
                  onClick={this.onPointClick}
                />
              ))}
            </DataList>
          </Aside>
        </div>
      </Page>
    );
  }
}

const WorkOrderHomeMemo = memo(WorkOrdersHome);

export default withRouter(WorkOrderHomeMemo);
