import { v2 as cloudinaryV2 } from 'cloudinary';
import {
  FileUploadService,
  UploadedFileResponse,
  UploadFileOptions,
  FileDeleteResult,
} from '../types/FileUploadService';
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOULD_NAME,
  IMAGES_PROJECT_FOLDER,
} from '../config';

export class CloudinaryFileUpload extends FileUploadService {
  private v2 = cloudinaryV2;
  private urlPrefixRegexp = new RegExp(`${CLOUDINARY_CLOULD_NAME}\/image\/upload\/v\\d+\/`);

  constructor() {
    super();

    this.v2.config({
      cloud_name: CLOUDINARY_CLOULD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  }

  private parseCloudinaryPublicId(url: string): string {
    const filePath = new URL(url).pathname.slice(1);

    const withoutPrefix = filePath.replace(this.urlPrefixRegexp, '');

    if (withoutPrefix.indexOf('.') > -1) {
      return withoutPrefix.slice(0, withoutPrefix.lastIndexOf('.'));
    }

    return withoutPrefix;
  }

  async uploadFile({
    file,
    pathEntries = [],
    projectFolder,
  }: UploadFileOptions): Promise<UploadedFileResponse> {
    const { createReadStream, encoding, filename, mimetype } = file;
    const fileStream = createReadStream();

    pathEntries.unshift(projectFolder || IMAGES_PROJECT_FOLDER);

    if (filename.indexOf('.') > -1) {
      pathEntries.push(filename.slice(0, filename.lastIndexOf('.')));
    } else {
      pathEntries.push(filename);
    }

    const filePath = pathEntries.map(encodeURIComponent).join('/');

    return new Promise((resolve, reject) => {
      const uploadStream = this.v2.uploader.upload_stream(
        {
          public_id: filePath,
          resource_type: 'image',
          overwrite: true,
          use_filename: true,
        },
        (err, response) => {
          if (err) {
            reject(err);

            return;
          }

          if (!response) {
            throw new Error('No response from cloudinary');
          }

          resolve({
            encoding,
            filename,
            mimetype,
            url: response.url,
          });
        },
      );

      fileStream.pipe(uploadStream, { end: true }).once('error', reject);
    });
  }

  deleteFile(url: string): Promise<FileDeleteResult> {
    const filePath = this.parseCloudinaryPublicId(url);

    return new Promise((resolve, reject) => {
      this.v2.uploader.destroy(filePath, (err, response) => {
        if (err) {
          reject(err);

          return;
        }

        if (response.result === 'not found') {
          resolve(FileDeleteResult.NOT_FOUND);

          return;
        }

        resolve(FileDeleteResult.OK);
      });
    });
  }
}
