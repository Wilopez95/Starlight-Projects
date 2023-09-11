import { connect } from 'react-redux';
import {
  createFacility,
  fetchFacilitiesIfNeeded,
  createSelectSManifestLoading,
  selectManifestFacilities,
} from '@root/state/modules/smanifest';
import Facilities from './Facilities';

const mapStateToProps = (state) => {
  const selectIsLoading = createSelectSManifestLoading();
  return {
    facilities: selectManifestFacilities(state),
    isLoading: selectIsLoading(state),
  };
};

const mapDispatchToProps = (dispatch) => ({
  createFacility: (formData) => dispatch(createFacility(formData)),
  fetchFacilities: () => dispatch(fetchFacilitiesIfNeeded()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Facilities);
