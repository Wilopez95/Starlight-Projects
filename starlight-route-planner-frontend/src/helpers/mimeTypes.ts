export const imageOnlyMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
export const acceptableMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const isImageFile = (file: File) =>
  imageOnlyMimeTypes.some(type => file.type.startsWith(type));

export const isPdfFile = (file: File) => file.type.startsWith('application/pdf');

export const hasPdfExtension = (src?: string) => {
  try {
    return !!src && new URL(src).pathname.endsWith('.pdf');
  } catch (_) {
    return false;
  }
};
