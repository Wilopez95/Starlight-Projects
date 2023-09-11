import { format } from 'date-fns';

import { dateFormatsEnUS } from '@root/i18n/format/date';

import { normalizeJsonBody } from './normalize';
import { HttpMethod } from './types';

type FilesArray = { key: string; value: Blob }[];

type FormDataInput = {
  files: FilesArray;
  payload: Record<string, unknown>;
};

const extractFiles = (
  files: FilesArray,
  payload: Record<string, unknown>,
  key: string | number,
  value: unknown,
  parentKey?: string | number | undefined,
) => {
  if (typeof value === 'function' || value === undefined) {
    // eslint-disable-next-line no-useless-return
    return;
  } else if (value instanceof Blob) {
    files.push({ key: parentKey ? `${parentKey}.${key}` : `${key}`, value });
  } else if (value instanceof Date) {
    payload[key] = format(value, dateFormatsEnUS.ISO);
  } else if (Array.isArray(value)) {
    payload[key] = [];
    value.forEach((item, index) => {
      extractFiles(files, payload[key] as Record<string, unknown>, index, item, key);
    });
  } else if (typeof value === 'object' && value !== null) {
    payload[key] = {};
    Object.entries(value).forEach(([k, v]) =>
      extractFiles(files, payload[key] as Record<string, unknown>, k, v),
    );
  } else {
    payload[key] = value;
  }
};

const serializePayload = (obj: Record<string, unknown>): FormDataInput => {
  const files: FilesArray = [];
  const payload = {};

  Object.entries(obj).forEach(([key, value]) => {
    extractFiles(files, payload, key, value);
  });

  return {
    files,
    payload,
  };
};

const serializeBlob = (formData: FormData, key: string, value: Blob) => {
  if (value instanceof File) {
    formData.append(key, value, value.name);
  } else {
    formData.append(key, value);
  }
};

export const serializeToFormData = (obj: Record<string, unknown>, method: HttpMethod) => {
  const formData = new FormData();

  const { files, payload } = serializePayload(obj);

  files.forEach(({ key, value }) => serializeBlob(formData, key, value));

  formData.append('payload', JSON.stringify(normalizeJsonBody(payload, method)));

  return formData;
};

export const convertToFormData = (files: File[]): FormData => {
  const formData = new FormData();

  files.forEach(file => formData.append('files', file));

  return formData;
};
