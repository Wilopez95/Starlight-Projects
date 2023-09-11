/* eslint-disable react/prop-types */

import { PureComponent } from 'react';
import { Link } from 'react-router-dom';

import AdminView from '@root/scenes/Admin/components/Layout/AdminView';
import injectReducer from '@root/utils/injectReducer';
import { smanifest } from '@root/state/modules/smanifest';
import Table from '@root/scenes/Admin/components/Table';

// type Props = {
//   fetchStructuredManifestsIfNeeded: () => void,
//   isLoading: boolean,
//   manifests: Array<StructuredManifestType>,
// };

class StructuredManifest extends PureComponent {
  componentDidMount() {
    this.props.fetchStructuredManifestsIfNeeded();
  }

  render() {
    const columns = [
      {
        Header: 'ID',
        accessor: 'id',
      },
      {
        Header: 'Pickup Source',
        accessor: 'locPickUpSource',
      },
      {
        Header: 'Generator Name',
        accessor: 'genName',
      },
      {
        Header: 'Generator Rep',
        accessor: 'genAuthRep',
      },
      {
        Header: 'Driver',
        accessor: 'transporterDriverName',
      },
      {
        Header: 'Receiving Facility',
        accessor: 'recFacName',
      },
      {
        Header: 'Receiving Facility Signee',
        accessor: 'recFacPrintName',
      },
      {
        Header: 'Work Order',
        accessor: 'workOrderId',
      },
      {
        Header: 'Manifest',
        width: 140,
        accessor: 's3url',
        sortable: false,
        Cell: ({ value }) =>
          value === null ? (
            <>
              Incomplete <i className="far fa-exclamation-triangle" />
            </>
          ) : (
            <a
              href={value}
              className="btn btn__default btn__small"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="far fa-file-download" /> Download
            </a>
          ),
      },
    ];
    return (
      <AdminView
        title="Structured Manifest"
        isLoading={this.props.isLoading}
        header={
          <>
            <Link to="/admin/structured-manifest/customers" className="btn btn__link pr-10">
              Customers
            </Link>
            <Link to="/admin/structured-manifest/facilities" className="btn btn__link pl-10">
              Facilities
            </Link>
          </>
        }
      >
        <Table columns={columns} data={this.props.manifests} loading={this.props.isLoading} />
      </AdminView>
    );
  }
}

export default injectReducer({ key: 'smanifest', reducer: smanifest })(StructuredManifest);
