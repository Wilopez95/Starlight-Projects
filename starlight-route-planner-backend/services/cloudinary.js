import cloudinary from 'cloudinary';

import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOULD_NAME,
  CLOUDINARY_PROJECT_FOLDER,
} from '../config.js';
import { getFilePathFromUrl } from '../utils/urlUtil.js';
import { WEIGHT_TICKETS_MEDIA_FOLDER } from '../consts/mediaStorage.js';

const cloudinaryV2 = cloudinary.v2;

cloudinaryV2.config({
  cloud_name: CLOUDINARY_CLOULD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const retrievePublicId = url => url.substring(0, url.lastIndexOf('.')) || url;

export const getWeightTicketMediaFilePath = ({ schema, mediaId, filename }) =>
  `${CLOUDINARY_PROJECT_FOLDER}/${WEIGHT_TICKETS_MEDIA_FOLDER}/${schema}/${mediaId}/${filename}`;

export const uploadFile = ({ fileStream, filePath }) =>
  new Promise((resolve, reject) => {
    const pubId = retrievePublicId(filePath);

    const uploadStream = cloudinaryV2.uploader.upload_stream(
      {
        public_id: pubId,
        resource_type: 'auto',
        // context: `caption=${caption}|alt=${alt}`,
        overwrite: true,
        disable_promises: true,
        flags: 'attachment', // This option allow immediately download media instead of open in new browser tab
      },
      (error, response) => (error ? reject(error) : resolve(response.secure_url)),
    );

    fileStream.pipe(uploadStream, { end: true });
  });

export const deleteFile = filePath =>
  new Promise((resolve, reject) => {
    cloudinaryV2.uploader.destroy(filePath, error => (error ? reject(error) : resolve()));
  });

export const deleteFileByUrl = url => deleteFile(getFilePathFromUrl(url));

export const deleteFilesByUrls = async urls => {
  const filePaths = urls.map(url => getFilePathFromUrl(url));
  await cloudinaryV2.api.delete_resources(filePaths);
};

export const getDirectUrl = path => cloudinaryV2.url(path);

export const getSignedUrl = url => {
  const key = new URL(url).pathname.split('/').slice(5).join('/');
  const pubId = retrievePublicId(key);
  const ext = key.substring(key.lastIndexOf('.') + 1);

  return cloudinaryV2.utils.private_download_url(pubId, ext);
};
