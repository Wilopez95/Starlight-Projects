import { IMAGES_TYPES } from '../consts/fileExtensions.js';

const mimeTypesUtil = (...types) => {
  const allowedMimeTypes = types.map(type => {
    if (IMAGES_TYPES.includes(type)) {
      return `image/${type}`;
    }
    return `application/${type}`;
  });

  const isMimeTypeAllowed = file =>
    allowedMimeTypes.some(mimeType => file.type.startsWith(mimeType));

  return { allowedMimeTypes, isMimeTypeAllowed };
};

export default mimeTypesUtil;
