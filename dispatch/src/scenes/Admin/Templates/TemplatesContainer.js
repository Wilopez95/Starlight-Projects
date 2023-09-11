import { connect } from 'react-redux';
import {
  loadTemplates,
  uploadLogo,
  deleteTemplate,
  selectTemplates,
  selectCurrentTemplate,
  selectTemplateLoading,
} from '@root/state/modules/templates';
import Templates from './Templates';

const mapStateToProps = (state) => ({
  setting: state.setting,
  templates: selectTemplates(state),
  isLoading: selectTemplateLoading(state),
  currentTemplate: selectCurrentTemplate(state),
});

const mapDispatchToProps = (dispatch) => ({
  loadTemplates: () => dispatch(loadTemplates()),
  uploadLogo: (file) => dispatch(uploadLogo(file)),
  deleteTemplate: (id) => dispatch(deleteTemplate(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Templates);
