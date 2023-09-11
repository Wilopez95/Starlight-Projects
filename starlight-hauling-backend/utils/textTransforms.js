export const toSlug = v =>
  v
    .toLowerCase()
    .replace(/[^0-9a-z\-_ ]/g, '')
    .replace(/[_ ]/g, '-');
