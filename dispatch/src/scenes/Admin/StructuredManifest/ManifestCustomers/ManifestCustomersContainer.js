import { connect } from 'react-redux';
import {
  createCustomer,
  fetchCustomersIfNeeded,
  createSelectSManifestLoading,
  selectManifestCustomers,
} from '@root/state/modules/smanifest';
import ManifestCustomers from './ManifestCustomers';

const mapStateToProps = (state) => {
  const selectIsLoading = createSelectSManifestLoading();
  return {
    customers: selectManifestCustomers(state),
    isLoading: selectIsLoading(state),
  };
};

const mapDispatchToProps = (dispatch) => ({
  createCustomer: (formData) => dispatch(createCustomer(formData)),
  fetchManifestCustomers: () => dispatch(fetchCustomersIfNeeded()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManifestCustomers);
