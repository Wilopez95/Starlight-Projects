import { Params } from '@root/core/consts';

type ParamsRecord = {
  [P in keyof typeof Params]?: string | number;
};

export const pathToUrl = (path: string, params?: ParamsRecord, trim = true) => {
  let newPath = path;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      newPath = newPath.replace(Params[key as keyof typeof Params], value?.toString() ?? '');
    });
  }

  if (trim) {
    newPath = newPath.replace(/\?/g, '').replace(/\/\//g, '');
  }

  if (process.env.NODE_ENV === 'development') {
    Object.values(Params).forEach((param) => {
      if (param.startsWith(':') && newPath.includes(param)) {
        console.warn(`Parameter ${param} detected in url ${newPath}`);
      }
    });
  }

  return newPath;
};
