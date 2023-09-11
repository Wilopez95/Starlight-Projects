import { createSelector } from 'reselect';

export const getTemplates = (state) => state.templates;

export const templatesById = (state) => state.templates.byId;

export const getTemplateIds = (state) => state.templates.ids;

export const getTemplateById = (state, id) => state.templates.byId[id];

export const selectTemplates = createSelector([getTemplateIds, templatesById], (ids, tpls) =>
  ids.map((id) => tpls[id]),
);

export const selectTemplateLoading = (state) => getTemplates(state).isLoading;

export const selectCurrentTemplate = createSelector(getTemplates, (tpl) => tpl && tpl.current);
