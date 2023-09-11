import { connect } from 'react-redux';
import {
  fetchStructuredManifestsIfNeeded,
  createSelectSManifestLoading,
  createSManifestEnabled,
  selectManifests,
} from '@root/state/modules/smanifest';
import StructuredManifest from './StructuredManifest';

const mapStateToProps = (state) => {
  const selectIsLoading = createSelectSManifestLoading();
  const selectManifestEnabled = createSManifestEnabled();
  return {
    setting: state.setting,
    enableStructuredManifest: selectManifestEnabled(state),
    isLoading: selectIsLoading(state),
    manifests: selectManifests(state),
  };
};

const mapDispatchToProps = (dispatch) => ({
  fetchStructuredManifestsIfNeeded: () => dispatch(fetchStructuredManifestsIfNeeded()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StructuredManifest);
