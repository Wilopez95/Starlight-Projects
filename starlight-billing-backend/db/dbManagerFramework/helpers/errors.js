export const isFileNotExistsError = error => error.code === 'ENOENT';

export const isPermissionError = error => error.code === 'EPERM';
