import AWS from 'aws-sdk';
import {
  AWS_REGION,
  AWS_S3_ACCESS_KEY_ID,
  AWS_S3_REGION,
  AWS_S3_SECRET_ACCESS_KEY,
  IMAGES_PROJECT_FOLDER,
} from '../config';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import {
  FileUploadService,
  UploadedFileResponse,
  UploadFileOptions,
  FileDeleteResult,
} from '../types/FileUploadService';

export interface S3UploadConfig {
  accessKeyId: string;
  secretAccessKey: string;
  destinationBucketName: string;
  region?: string;
}

interface S3UploaderOptions {
  bucket?: string;
}

interface GetObjectPresignedUrl {
  /**
   * default: 900 — the number of seconds to expire the pre-signed URL operation in. Defaults to 15 minutes
   */
  Expires?: number;
}

export class S3Uploader extends FileUploadService {
  private s3: AWS.S3;
  private bucket: string;

  constructor({ bucket }: S3UploaderOptions = {}) {
    super();

    AWS.config = new AWS.Config();
    AWS.config.update({
      region: AWS_REGION,
      accessKeyId: AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
    });

    if (!bucket) {
      throw new Error('Missing bucket for S3Uploader');
    }

    this.bucket = bucket;
    this.s3 = new AWS.S3({
      region: AWS_S3_REGION,
    });
  }

  async getPresignedUrl(url: string, params: GetObjectPresignedUrl = {}): Promise<string> {
    const key = new URL(url).pathname.slice(1);

    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucket,
      Key: key,
      ...params,
    });
  }

  async getObject(url: string): Promise<Buffer> {
    const key = new URL(url).pathname.slice(1);
    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    return new Promise((resolve, reject) => {
      this.s3.getObject(params, (err, data) => {
        if (err) {
          reject(err);

          return;
        }

        if (!data.Body) {
          reject(new Error('Object not found'));

          return;
        }

        resolve(data.Body as Buffer);
      });
    });
  }

  async uploadFile({
    file,
    pathEntries = [],
    projectFolder,
  }: UploadFileOptions): Promise<UploadedFileResponse> {
    try {
      const { createReadStream, encoding, filename, mimetype } = file;
      const fileContent = createReadStream();

      pathEntries.unshift(projectFolder || IMAGES_PROJECT_FOLDER);
      pathEntries.push(filename);

      const filePath = pathEntries.map(encodeURIComponent).join('/');
      const params: PutObjectRequest = {
        Bucket: this.bucket,
        Key: filePath,
        Body: fileContent,
        ContentType: mimetype,
        // todo: enable public access to file due to invoicing requirements
        ACL: 'public-read',
      };

      return new Promise((resolve, reject) => {
        this.s3.upload(params, (err, data) => {
          if (err) {
            reject(err);

            return;
          }

          resolve({ filename, mimetype, encoding, url: data.Location });
        });
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(url: string): Promise<FileDeleteResult> {
    const key = new URL(url).pathname.slice(1);
    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    await this.s3.deleteObject(params).promise();

    return FileDeleteResult.OK;
  }
}
