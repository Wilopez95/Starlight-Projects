import {
  attachmentCategoryEnum,
  imageExtensions,
  mediaExtensions,
  pdfExtension,
} from '@root/consts';
import { IAdditionalAttachmentFields, JsonConversions } from '@root/types';
import { IResponseAttachment } from '@root/types/responseEntities';

const extensionRegExp = /\.[0-9a-z]+$/i;

export const getAdditionalFields = (
  file: JsonConversions<IResponseAttachment>,
): IAdditionalAttachmentFields => {
  const extension = extensionRegExp.exec(file.fileName)![0];
  const isImage = imageExtensions.some(ext => ext === extension);
  const isMedia = mediaExtensions.some(ext => ext === extension);
  const isPdf = extension === pdfExtension;
  const fileIsNoViewable = !isImage && !isPdf;
  const category = isImage
    ? attachmentCategoryEnum.image
    : isMedia
    ? attachmentCategoryEnum.media
    : attachmentCategoryEnum.document;

  return {
    extension,
    isImage,
    isPdf,
    fileIsNoViewable,
    category,
  };
};
