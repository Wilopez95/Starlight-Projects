/* eslint-disable react/prop-types */
import { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Link, withRouter } from 'react-router-dom';
import moment from 'moment-timezone';
import { Tooltip } from 'react-tippy';
import ReactTable from 'react-table';
import { fetchWorkOrders, filterChange, removeWorkOrder } from '@root/state/modules/workOrders';
import { fetchConstantsIfNeeded } from '@root/state/modules/constants';
import Page from '@root/components/Layout/Page';
import Footer from '@root/components/Footer';

import FilterForm from '@root/forms/WorkOrdersTableFilter';
import { pathToUrl } from '@root/helpers/pathToUrl';
import { Paths } from '@root/routes/routing';

const HEADER_CLASS_NAME = 'wo-table-header';
const CELL_CLASS_NAME = 'cell--center';

class WorkOrderTable extends Component {
  static displayName = 'WorkOrderTable';

  static propTypes = {
    workOrders: PropTypes.array,
    dispatch: PropTypes.func,
    filter: PropTypes.object,
    statuses: PropTypes.array,
    materials: PropTypes.array,
    sizes: PropTypes.array,
    isLoading: PropTypes.bool,
    actions: PropTypes.array,
    children: PropTypes.element,
    history: PropTypes.object,
  };

  componentDidMount() {
    const bounds = null;

    this.props.dispatch(fetchConstantsIfNeeded());
    // this.props.dispatch(filterChange({ bounds }));
    this.props.dispatch(
      fetchWorkOrders(
        {
          ...this.props.filter,
          bounds,
          businessUnitId: this.props.match.params.businessUnit,
        },
        'workorders',
      ),
    );
  }

  onDelete = (value) => {
    // necessary to have this for our users
    // eslint-disable-next-line no-alert
    if (confirm('Are you sure?')) {
      this.props.dispatch(removeWorkOrder(value));
    }
  };

  onFilterChange = (filter = {}) => {
    this.props.dispatch(filterChange(filter));
    // , workorders makes it not strip out modified date
    this.props.dispatch(
      fetchWorkOrders(
        { businessUnitId: this.props.match.params.businessUnit, ...filter },
        'workorders',
      ),
    );
  };

  render() {
    const { filter, statuses, sizes, materials, actions, isLoading } = this.props;
    const workOrders = this.props.workOrders.filter(item => {

      return item.location1?.id !== undefined && item.location1?.id !== null
    })

    const actionTypes = actions.map((act) => ({
      label: act.label === 'SPOT' ? 'DELIVERY' : act.label,
      value: act.value,
    }));
    const pageSizes = [10, 20, 25, 50, 100].filter((num) => num < workOrders.length);
    pageSizes.push(workOrders.length);
    const columns = [
      {
        Header: 'ID',
        accessor: 'id',
        maxWidth: 40,
        headerClassName: HEADER_CLASS_NAME,
        className: CELL_CLASS_NAME,
      },
      {
        Header: () => (
          <span>
            Customer
            <br /> Name
          </span>
        ),
        accessor: 'customerName',
        headerClassName: HEADER_CLASS_NAME,
        className: CELL_CLASS_NAME,
      },
      {
        Header: 'Type',
        accessor: 'action',
        headerClassName: HEADER_CLASS_NAME,
        className: CELL_CLASS_NAME,
        Cell: (row) => {
          let actionType = row.value;
          if (actionType === 'SPOT') {
            actionType = 'DELIVERY';
          }
          return <span>{actionType}</span>;
        },
      },
      {
        Header: 'Can size',
        accessor: 'size',
        maxWidth: 60,
        headerClassName: HEADER_CLASS_NAME,
        className: CELL_CLASS_NAME,
      },
      {
        Header: 'Material',
        accessor: 'material',
        headerClassName: HEADER_CLASS_NAME,
        className: CELL_CLASS_NAME,
      },
      {
        Header: 'Driver',
        accessor: 'driver.description',
        headerClassName: HEADER_CLASS_NAME,
        className: CELL_CLASS_NAME,
      },
      {
        Header: 'Time start',
        accessor: 'scheduledStart',
        headerClassName: HEADER_CLASS_NAME,
        className: CELL_CLASS_NAME,
        Cell: (row) => (
          <span>
            {row.original.scheduledStart
              ? moment(row.original.scheduledDate).format('MM/DD/YYYY')
              : '–'}
            <br />
            {row.value ? moment(row.value, 'HH:mm:ss').format('hh:mm a') : ''}
          </span>
        ),
      },
      {
        Header: 'Time end',
        accessor: 'scheduledEnd',
        headerClassName: HEADER_CLASS_NAME,
        className: CELL_CLASS_NAME,
        Cell: (row) => (
          <span>
            {row.original.scheduledEnd
              ? moment(row.original.scheduledDate).format('MM/DD/YYYY')
              : '–'}
            <br />
            {row.value ? moment(row.value, 'HH:mm:ss').format('hh:mm a') : ''}
          </span>
        ),
      },
      {
        Header: 'Location',
        accessor: 'location1.name',
        headerClassName: HEADER_CLASS_NAME,
        className: CELL_CLASS_NAME,
      },
      {
        Header: 'Priority',
        accessor: 'priority',
        headerClassName: HEADER_CLASS_NAME,
        className: CELL_CLASS_NAME,
        maxWidth: 60,
      },
      {
        Header: 'Status',
        accessor: 'status',
        headerClassName: HEADER_CLASS_NAME,
        className: CELL_CLASS_NAME,
      },
      {
        Header: () => (
          <span>
            Progress
            <br /> Step
          </span>
        ),
        accessor: 'step',
        headerClassName: HEADER_CLASS_NAME,
        className: CELL_CLASS_NAME,
      },
      {
        Header: 'Updated',
        accessor: 'modifiedDate',
        headerClassName: HEADER_CLASS_NAME,
        className: CELL_CLASS_NAME,
        Cell: ({ value }) => (
          <span>
            {value
              ? moment
                .utc(value)
                .tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                .format('hh:mm a MM-DD-YY')
              : '–'}
          </span>
        ),
      },
      {
        Header: 'Actions',
        accessor: 'id',
        minWidth: 130,
        sortable: false,
        headerClassName: HEADER_CLASS_NAME,
        Cell: ({ value }) => (
          <div className="btn-group">
            <Link
              to={{
                pathname: pathToUrl(Paths.WorkOrdersTableEdit, {
                  businessUnit: this.props.match.params.businessUnit,
                  value,
                }),
                state: { modal: true },
              }}
              className="btn btn__default btn__small"
            >
              <i className="far fa-edit" /> Edit
            </Link>
            <button
              type="button"
              onClick={() => this.onDelete(value)}
              className="btn btn__default btn__small"
            >
              <i className="far fa-trash" /> Delete
            </button>
          </div>
        ),
      },
    ];

    return (
      <div>
        <Page name="searchResultsTable">
          <header className="page-header">
            <div className="header__column header__column--title">
              <h2 className="page-title">Work Orders</h2>
            </div>
            <div className="header__column header__column--filter">
              <div
                className={cx('filter filter--table', {
                  disabled: isLoading,
                })}
              >
                <FilterForm
                  onChange={this.onFilterChange}
                  statuses={statuses}
                  state={filter}
                  sizes={sizes}
                  materials={materials}
                  actions={actionTypes}
                />
              </div>
            </div>
            <div className="header__column header__column--controls">
              <div className="btn-group">
                <Tooltip title="Print All" position="top" trigger="mouseenter">
                  <button type="button" className="btn btn__default btn__small">
                    <i className="far fa-print" />
                    Print All
                  </button>
                </Tooltip>
                <Tooltip title="Export to CSV" position="top" trigger="mouseenter">
                  <Link
                    className="btn btn__default btn__small"
                    to={{
                      pathname: pathToUrl(`${Paths.WorkOrdersTable}/export`, {
                        businessUnit: this.props.match.params.businessUnit,
                      }),
                      state: { modal: true },
                    }}
                  >
                    Export
                  </Link>
                </Tooltip>
              </div>
            </div>
          </header>
          <div className="page-inner">
            <ReactTable
              data={workOrders}
              columns={columns}
              pageSizeOptions={pageSizes}
              defaultPageSize={10}
            />
          </div>
        </Page>
        {this.props.children}
        <Footer />
      </div>
    );
  }
}

export default withRouter(WorkOrderTable);
