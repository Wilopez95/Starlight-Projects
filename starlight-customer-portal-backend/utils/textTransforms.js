export const toSlug = (v) =>
  v
    .toLowerCase()
    .replace(/[^0-9a-z\-_ ]/g, '')
    .replace(/[_ ]/g, '-');

export const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);
