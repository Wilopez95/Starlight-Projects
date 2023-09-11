export const startUpperCase = (str: string) => str.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
