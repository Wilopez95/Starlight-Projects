export const buildPath = (fieldName: string, basePath: string[] = []) => {
  return [...basePath, fieldName].join('.');
};
