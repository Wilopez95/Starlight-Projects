export const imageOnlyMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
export const acceptableMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const isImageFile = (file: File) =>
  imageOnlyMimeTypes.some((type) => file.type.startsWith(type));

export const isPdfFile = (file: File) => file.type.startsWith('application/pdf');
