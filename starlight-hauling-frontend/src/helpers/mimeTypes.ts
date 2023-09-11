export const imageOnlyMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
export const acceptableMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export const documentsOnlyMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
export const mediaOnlyMimeTypes = ['audio/mpeg', 'video/mp4', 'application/mp4'];
export const attachmentMimeTypes = [
  ...imageOnlyMimeTypes,
  ...documentsOnlyMimeTypes,
  ...mediaOnlyMimeTypes,
  'application/x-zip-compressed',
  '.doc', // used to avoid bug when react-dropzone doesn't see doc files in folder
  '.docx',
];

export const isImageFile = (file: File) =>
  imageOnlyMimeTypes.some(type => file.type.startsWith(type));

export const isPdfFile = (file: File) => file.type.startsWith('application/pdf');

export const isDocumentFile = (file: File) =>
  documentsOnlyMimeTypes.some(type => file.type.startsWith(type));

export const isMediaFile = (file: File) =>
  mediaOnlyMimeTypes.some(type => file.type.startsWith(type));

export const isArchiveFile = (file: File) => file.type.startsWith('application/x-zip-compressed');
