import { AWS_S3_BUCKET, S3_AS_MEDIA_STORAGE } from '../config';
import { FileUploadService } from '../types/FileUploadService';
import { S3Uploader } from './s3';
import { CloudinaryFileUpload } from './cloudinary';

export const filesUploadService = new S3Uploader({ bucket: AWS_S3_BUCKET });
export const mediaUploadService: FileUploadService = S3_AS_MEDIA_STORAGE
  ? filesUploadService
  : new CloudinaryFileUpload();

export default mediaUploadService;
