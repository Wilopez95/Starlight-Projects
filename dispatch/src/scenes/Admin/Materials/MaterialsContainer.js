import { connect } from 'react-redux';

import {
  fetchMaterialsIfNeeded,
  removeMaterial,
  selectMaterials,
  getMaterialsLoading,
} from '@root/state/modules/materials';
import Materials from './Materials';

const mapStateToProps = (state) => ({
  materials: selectMaterials(state),
  isLoading: getMaterialsLoading(state),
});

const mapDispatchToProps = (dispatch) => ({
  fetchMaterials: () => dispatch(fetchMaterialsIfNeeded()),
  removeMaterial: (id) => dispatch(removeMaterial(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Materials);
