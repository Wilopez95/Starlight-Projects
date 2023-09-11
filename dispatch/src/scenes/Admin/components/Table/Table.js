/* eslint-disable react/prefer-stateless-function */
import { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';

class Table extends Component {
  static propTypes = {
    columns: PropTypes.array,
    data: PropTypes.array,
    loading: PropTypes.bool,
  };

  static defaultProps = {
    data: [],
    columns: [],
    loading: false,
  };

  render() {
    const { data, loading, columns } = this.props;
    const pageSizes = [10, 20, 25, 50, 100].filter((num) => num < data.length);
    pageSizes.push(data.length);

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

export default Table;
