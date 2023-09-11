/* eslint-disable react/prop-types */

import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import Table from '@root/scenes/Admin/components/Table';
import { fetchSizes, removeSize, sizes } from '@root/state/modules/sizes';
import AdminView from '@root/scenes/Admin/components/Layout/AdminView';
import injectReducer from '@root/utils/injectReducer';

// type Props = {
//   fetchSizes: () => void,
//   removeSize: number => void,
//   isLoading: boolean,
//   sizes: Array<SizeType>,
// };

class Sizes extends PureComponent {
  static defaultProps = {
    sizes: [],
  };

  componentDidMount() {
    this.props.fetchSizes();
  }

  onDelete(entityId) {
    // eslint-disable-next-line
    if (confirm("Are you sure?")) {
      this.props.removeSize(entityId);
    }
  }

  render() {
    const columns = [
      {
        Header: 'Size Name',
        accessor: 'name',
      },
    ];

    return (
      <>
        <Helmet title="Sizes" />
        <AdminView title="Sizes" loading={this.props.isLoading}>
          <Table
            data={this.props.sizes}
            columns={columns}
            loading={this.props.isLoading}
            defaultPageSize={20}
          />
        </AdminView>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  sizes: state.sizes.list,
  isLoading: state.sizes.isLoading,
});

const mapDispatchToProps = (dispatch) => ({
  fetchSizes: () => dispatch(fetchSizes()),
  removeSize: (id) => dispatch(removeSize(id)),
});

const connectedSizes = connect(mapStateToProps, mapDispatchToProps)(Sizes);

export default injectReducer({ key: 'sizes', reducer: sizes })(connectedSizes);
