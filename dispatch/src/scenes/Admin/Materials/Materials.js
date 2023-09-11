/* eslint-disable react/prop-types */

import { PureComponent } from 'react';
import { Helmet } from 'react-helmet';

import AdminView from '@root/scenes/Admin/components/Layout/AdminView';
import Table from '@root/scenes/Admin/components/Table';

// type Props = {
//   fetchMaterials: () => void,
//   removeMaterial: number => void,
//   materials: MaterialsType,
//   isLoading: boolean,
// };
export default class Materials extends PureComponent {
  componentDidMount() {
    this.props.fetchMaterials();
    if (this.props.location.search === '?redirect=true') {
      this.props.history.push('/configuration/inventory-board');
    }
  }

  onDelete(entityId) {
    // eslint-disable-next-line
    if (confirm("Are you sure?")) {
      this.props.removeMaterial(entityId);
    }
  }

  render() {
    const { materials, isLoading } = this.props;

    const columns = [
      {
        Header: 'Material Name',
        accessor: 'name',
      },
    ];
    return (
      <>
        <Helmet title="Materials" />
        <AdminView title="Materials" loading={isLoading}>
          <Table data={materials} columns={columns} loading={isLoading} defaultPageSize={20} />
        </AdminView>
      </>
    );
  }
}
