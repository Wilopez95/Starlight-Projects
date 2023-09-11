/* eslint-disable react/prop-types */

import { PureComponent } from 'react';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';
import matchSorter from 'match-sorter';
import moment from 'moment';
import { Loader } from '@root/components/index';

class TripsTable extends PureComponent {
  render() {
    const { trips } = this.props;
    return trips ? (
      <ReactTable
        data={trips}
        className="-striped -highlight user-list-table"
        minRows={3}
        maxRows={3}
        filterable
        defaultFilterMethod={(filter, row) => String(row[filter.id]) === filter.value}
        columns={[
          {
            Header: 'id',
            accessor: 'id',
            style: { textAlign: 'center', alignSelf: 'center' },
            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ['id'] }),
            filterAll: true,
          },
          {
            Header: 'Created By',
            accessor: 'createdBy',
            style: { textAlign: 'center', alignSelf: 'center' },
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ['createdBy'] }),
            filterAll: true,
            show: true,
          },
          {
            Header: 'Driver Name',
            accessor: 'driver.description',
            style: { textAlign: 'center', alignSelf: 'center' },
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ['driver.description'] }),
            filterAll: true,
            show: true,
          },
          {
            Header: 'Created Date',
            accessor: 'createdDate',
            style: { textAlign: 'center', alignSelf: 'center' },
            Cell: (row) => (
              <span>
                {row.value
                  ? moment
                      .utc(row.value)
                      .tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                      .format('MM-DD-YYYY LT')
                  : '_'}
              </span>
            ),
          },
          {
            Header: 'Odometer',
            accessor: 'odometer',
            style: { textAlign: 'center', alignSelf: 'center' },
            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ['odometer'] }),
            filterAll: true,
            show: true,
          },
          {
            id: 'actions',
            Header: 'Actions',
            filterable: false,
            width: 80,
            Cell: ({ original }) => (
              <span
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Link
                  to={`/configuration/trips/${original.id}/edit-trips`}
                  className="btn btn__link"
                >
                  <i className="fas fa-pencil-alt" /> Edit
                </Link>
              </span>
            ),
          },
        ]}
      />
    ) : (
      <Loader />
    );
  }
}

export default TripsTable;
