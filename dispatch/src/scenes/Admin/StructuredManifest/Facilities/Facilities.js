/* eslint-disable react/prop-types */

import { Component } from 'react';
import AdminView from '@root/scenes/Admin/components/Layout/AdminView';
import injectReducer from '@root/utils/injectReducer';
import { smanifest } from '@root/state/modules/smanifest';

import Table from '@root/scenes/Admin/components/Table';
import FacilitiesForm from './FacilitiesForm';

// type Props = {
//   isLoading: boolean,
//   facilities: Array<ManifestFacilityType>,
//   fetchFacilities: () => void,
//   createFacility: ManifestFacilityType => void,
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
];

class Facilities extends Component {
  state = {
    formVisible: true,
  };

  componentDidMount() {
    this.props.fetchFacilities();
  }

  handleCreateFacility = (formData) => {
    this.props.createFacility(formData);
  };

  handleToggleFacilitiesForm = () => {
    this.setState((prevState) => ({
      formVisible: !prevState.formVisible,
    }));
  };

  render() {
    return (
      <AdminView
        title="Structured Manifest Facilities"
        isLoading={this.props.isLoading}
        header={
          <button
            onClick={this.handleToggleFacilitiesForm}
            className="btn btn__default toggle-form"
            type="button"
          >
            {this.state.formVisible ? 'Hide Form' : 'Add Facility'}
          </button>
        }
      >
        {this.state.formVisible ? (
          <FacilitiesForm onSubmitForm={this.handleCreateFacility} />
        ) : null}
        <Table data={this.props.facilities} columns={columns} loading={this.props.isLoading} />
      </AdminView>
    );
  }
}

export default injectReducer({ key: 'smanifest', reducer: smanifest })(Facilities);
