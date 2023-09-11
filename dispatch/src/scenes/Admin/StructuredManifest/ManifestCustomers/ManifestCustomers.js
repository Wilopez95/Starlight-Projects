/* eslint-disable react/prop-types */

import { Component } from 'react';
import AdminView from '@root/scenes/Admin/components/Layout/AdminView';

import injectReducer from '@root/utils/injectReducer';
import { smanifest } from '@root/state/modules/smanifest';
import Table from '@root/scenes/Admin/components/Table';
import ManifestCustomersForm from './ManifestCustomersForm';

// type Props = {
//   isLoading: boolean,
//   customers: Array<ManifestCustomerType>,
//   fetchManifestCustomers: () => void,
//   createCustomer: ManifestCustomerType => void,
// };

const columns = [
  {
    Header: 'Name',
    accessor: 'name',
  },
  {
    Header: 'Address',
    accessor: 'address',
  },
  {
    Header: 'City',
    accessor: 'city',
  },
  {
    Header: 'State',
    accessor: 'state',
  },
  {
    Header: 'Zip',
    accessor: 'zip',
  },
  {
    Header: 'Phone',
    accessor: 'phone',
  },
  {
    Header: 'Authorized Rep',
    accessor: 'authorizedRep',
  },
];

class ManifestCustomers extends Component {
  state = {
    formVisible: true,
  };

  componentDidMount() {
    this.props.fetchManifestCustomers();
  }

  handleCreateCustomer = (formData) => {
    this.props.createCustomer(formData);
  };

  handleToggleCustomerForm = () => {
    this.setState((prevState) => ({
      formVisible: !prevState.formVisible,
    }));
  };

  render() {
    return (
      <AdminView
        title="Structured Manifest Customers"
        header={
          <button
            onClick={this.handleToggleCustomerForm}
            className="btn btn__success toggle-form"
            type="button"
          >
            {this.state.formVisible ? 'Hide Form' : 'Add Customer'}
          </button>
        }
        isLoading={this.props.isLoading}
      >
        {this.state.formVisible ? (
          <ManifestCustomersForm onSubmitForm={this.handleCreateCustomer} />
        ) : null}
        <Table data={this.props.customers} columns={columns} loading={this.props.isLoading} />
      </AdminView>
    );
  }
}

export default injectReducer({ key: 'smanifest', reducer: smanifest })(ManifestCustomers);
