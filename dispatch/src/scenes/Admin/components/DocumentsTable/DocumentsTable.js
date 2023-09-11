import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import ReactTable from 'react-table';

class DocumentsTable extends PureComponent {
  static propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool,
  };

  static defaultProps = {
    data: [],
    loading: false,
  };

  render() {
    const { data, loading } = this.props;
    const pageSizes = [10, 20, 25, 50, 100].filter((num) => num < data.length);
    pageSizes.push(data.length);
    const columns = [
      {
        Header: 'Date',
        accessor: 'createdDate',
        Cell: ({ value }) => (
          <span>
            {value
              ? moment
                  .utc(value)
                  .tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                  .format('MM-DD-YYYY hh:mm:ss a')
              : '–'}
          </span>
        ),
      },
      {
        Header: 'Signed',
        accessor: 'printedName',
      },
      {
        Header: 'Driver',
        accessor: 'driver',
      },
      {
        Header: 'Work Order',
        accessor: 'workOrderId',
      },
      {
        Header: 'File',
        accessor: 'url',
        Cell: ({ value }) => (
          <a href={value} className="btn btn__default btn__small">
            <i className="far fa-download" /> Download
          </a>
        ),
      },
    ];
    return (
      <ReactTable
        data={data}
        columns={columns}
        loading={loading}
        pageSizeOptions={pageSizes}
        defaultPageSize={10}
      />
    );
  }
}

export default DocumentsTable;
