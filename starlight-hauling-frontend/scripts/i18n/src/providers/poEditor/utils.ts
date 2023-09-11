import { ReadStream } from 'fs';
import FormData from 'form-data';

export const toUrlEncoded = <T extends Record<string, string>>(obj: T) =>
  Object.keys(obj)
    .map((k) => `${encodeURIComponent(k)  }=${  encodeURIComponent(obj[k])}`)
    .join('&');

export const toFormData = <T extends Record<string, string | ReadStream>>(obj: T) =>
  Object.keys(obj).reduce((formData, key) => {
    formData.append(key, obj[key]);

    return formData;
  }, new FormData());
