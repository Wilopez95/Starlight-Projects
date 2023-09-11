export { default as templates } from './reducer';
export {
  createTemplate,
  fetchTemplates,
  // setTemplate,
  loadTemplates,
  updateTemplate,
  uploadLogo,
  deleteTemplate,
  clearPreviewImage,
  getTemplate,
} from './actions';

export {
  getTemplates,
  templatesById,
  getTemplateIds,
  selectTemplates,
  getTemplateById,
  selectTemplateLoading,
  selectCurrentTemplate,
} from './selectors';
