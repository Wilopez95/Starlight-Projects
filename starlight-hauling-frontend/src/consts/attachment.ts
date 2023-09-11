/* eslint-disable @typescript-eslint/naming-convention */
export const MAX_IMAGE_SIZE = 20971520; // 20Mb
export const MAX_DOCUMENT_SIZE = 52428800; // 50Mb
export const MAX_MEDIA_SIZE = 1073741824; // 1Gb

export const imageExtensions = ['.jpeg', '.jpg', '.png', '.webp'];
export const mediaExtensions = ['.mp3', '.mp4'];
export const pdfExtension = '.pdf';

// eslint-disable-next-line no-shadow
export enum attachmentCategoryEnum {
  image = 'image',
  media = 'media',
  document = 'document',
}
