import request from '@root/helpers/request';
import { toast } from '@root/components/Toast';
import { template as templateSchema } from '../../schema';
import * as t from './actionTypes';

export function fetchTemplatesReq() {
  return {
    type: t.FETCH_TEMPLATES_REQUEST,
  };
}

export function fetchTemplatesSuccess(templates) {
  return {
    type: t.FETCH_TEMPLATES_SUCCESS,
    payload: templates,
    meta: {
      schema: [templateSchema],
    },
  };
}
export function fetchTemplatesFailure(error) {
  return {
    type: t.FETCH_TEMPLATES_FAILURE,
    error,
  };
}

export function fetchTemplates() {
  return async (dispatch) => {
    dispatch(fetchTemplatesReq());

    try {
      const { data } = await request.get('templates');
      return dispatch(fetchTemplatesSuccess(data));
    } catch (error) {
      dispatch(fetchTemplatesFailure(error));
      return Promise.reject(error);
    }
  };
}

// function shouldFetchTemplates(state) {
//   if (state.templates.ids.length < 1) {
//     return true;
//   } else if (state.templates.isLoading) {
//     return false;
//   }
//   return false;
// }

export function loadTemplates() {
  return (dispatch) => dispatch(fetchTemplates());
  // if (shouldFetchTemplates(getState())) {
  //   return dispatch(fetchTemplates());
  // }
  // return null;
}

export function createTemplateRequest() {
  return { type: t.CREATE_TEMPLATE_REQUEST };
}

export function createTemplateSuccess(newTemplate) {
  return {
    type: t.CREATE_TEMPLATE_SUCCESS,
    payload: newTemplate,
    meta: { schema: templateSchema },
  };
}

export function createTemplateFailure(error) {
  return { type: t.CREATE_TEMPLATE_FAILURE, error };
}
export function uploadLogoReq() {
  return { type: t.UPLOAD_LOGO_REQUEST };
}
export function uploadLogoSuccess(payload) {
  return { type: t.UPLOAD_LOGO_SUCCESS, payload };
}

export function uploadLogoFailure(error) {
  return { type: t.UPLOAD_LOGO_FAILURE, error };
}
export function clearPreviewImage() {
  return { type: t.CLEAR_PREVIEW_IMAGE };
}
export function uploadLogo(payload) {
  return async (dispatch) => {
    dispatch(uploadLogoReq());
    const data = new FormData();
    data.append('file', payload);
    try {
      const body = await request.post('upload', data);
      dispatch(uploadLogoSuccess(body));
      return body;
    } catch (error) {
      dispatch(uploadLogoFailure(error));
      return Promise.reject(error);
    }
  };
}

export function createTemplate(tpl) {
  return async (dispatch) => {
    dispatch(createTemplateRequest());

    try {
      const { data } = await request.post('templates', tpl);
      toast.success('Template created', {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      return dispatch(createTemplateSuccess(data));
    } catch (error) {
      toast.error('Template with this name already exists', {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      dispatch(createTemplateFailure(error));
      return Promise.reject(error);
    }
  };
}

export function clearTemplate() {
  return { type: t.CLEAR_TEMPLATE };
}

export function deleteTemplateRequest() {
  return { type: t.DELETE_TEMPLATE_REQUEST };
}

export function deleteTemplateSuccess(id) {
  return { type: t.DELETE_TEMPLATE_SUCCESS, id };
}

export function deleteTemplateFailure(error) {
  return { type: t.DELETE_TEMPLATE_FAILURE, error };
}
export function deleteTemplate(id) {
  return async (dispatch) => {
    dispatch(deleteTemplateRequest());

    try {
      await request.delete(`templates/${id}`);
      toast.success('Deleted template', {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      return dispatch(deleteTemplateSuccess(id));
    } catch (error) {
      dispatch(deleteTemplateFailure(error));
      return Promise.reject(error);
    }
  };
}

export function updateTemplateRequest() {
  return { type: t.UPDATE_TEMPLATE_REQUEST };
}

export function updateTemplateSuccess(modifiedTemplate) {
  return {
    type: t.UPDATE_TEMPLATE_SUCCESS,
    payload: modifiedTemplate,
    meta: { schema: templateSchema },
  };
}

export function updateTemplateFailure(error) {
  return { type: t.UPDATE_TEMPLATE_FAILURE, error };
}

export function updateTemplate(id, tpl) {
  return async (dispatch) => {
    dispatch(updateTemplateRequest());

    try {
      const { data } = await request.put(`templates/${id}`, tpl);

      toast.success('Updated template', {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      return dispatch(updateTemplateSuccess(data));
    } catch (error) {
      dispatch(updateTemplateFailure(error));
      return Promise.reject(error);
    }
  };
}

export function getTemplateRequest() {
  return { type: t.GET_TEMPLATE_REQUEST };
}

export function getTemplateSuccess(tpl) {
  return { type: t.GET_TEMPLATE_SUCCESS, payload: tpl };
}

export function getTemplateFailure(error) {
  return { type: t.GET_TEMPLATE_FAILURE, error };
}

export function getTemplate(id) {
  return async (dispatch) => {
    dispatch(getTemplateRequest());

    try {
      const { data } = await request.get(`templates/${id}`);

      return dispatch(getTemplateSuccess(data));
    } catch (error) {
      dispatch(getTemplateFailure(error));
      return Promise.reject(error);
    }
  };
}
