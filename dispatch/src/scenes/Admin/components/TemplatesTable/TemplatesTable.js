import { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import ReactTable from 'react-table';

const Content = styled.div`
  height: 50px;
  overflow: hidden;
`;
class TemplatesTable extends Component {
  static propTypes = {
    onDeleteTemplate: PropTypes.func,
    data: PropTypes.array,
    loading: PropTypes.bool,
  };

  static defaultProps = {
    data: [],
    loading: false,
  };

  onDelete(entityId) {
    const { onDeleteTemplate } = this.props;
    onDeleteTemplate(entityId);
  }

  render() {
    const { data, loading } = this.props;
    const pageSizes = [10, 20, 25, 50, 100].filter((num) => num < data.length);
    pageSizes.push(data.length);
    const columns = [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Description',
        accessor: 'description',
      },
      {
        Header: 'Content',
        minWidth: 200,
        accessor: 'content',
        Cell: ({ value }) => <Content dangerouslySetInnerHTML={{ __html: value }} />,
      },
      {
        Header: 'Actions',
        width: 140,
        accessor: 'id',
        sortable: false,
        Cell: ({ value }) => (
          <div className="btn-group">
            <Link
              to={`/configuration/templates/${value}/edit`}
              className="btn btn__default btn__small"
            >
              <i className="far fa-pencil" /> Edit
            </Link>
            <button
              type="button"
              className="btn btn__default btn__small"
              onClick={() => this.onDelete(value)}
            >
              <i className="far fa-trash-alt" /> Delete
            </button>
          </div>
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

export default TemplatesTable;
