import { connect } from 'react-redux';
import {
  updateTemplate,
  uploadLogo,
  clearPreviewImage,
  getTemplate,
} from '@root/state/modules/templates';
import { ModifyTemplate } from './ModifyTemplate';

const mapStateToProps = (state) => ({
  template: state.templates.current,
  isLoading: state.templates.isLoading,
  setting: state.setting,
  templates: state.templates,
});
const mapDispatchToProps = (dispatch) => ({
  getTemplate: (id) => dispatch(getTemplate(id)),
  updateTemplate: (id, values) => dispatch(updateTemplate(id, values)),
  uploadLogo: (image) => dispatch(uploadLogo(image)),
  clearPreviewImage: () => dispatch(clearPreviewImage()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModifyTemplate);
