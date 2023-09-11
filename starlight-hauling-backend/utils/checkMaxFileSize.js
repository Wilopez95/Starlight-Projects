// 10 Mb (bcz of Cloudinary)
const fileFormats = [
  {
    maxSize: 1e7, // 10 Mb
    types: ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp', 'eps', 'raw', 'svg'], // images
  },
  {
    maxSize: 1e7, // 10 Mb
    types: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'odt', 'ods'], // documents
  },
  {
    maxSize: 1099511627776, // 1 Tb
    types: [
      'mp3',
      'mp4',
      'zip',
      'rar',
      'tgz',
      'webm',
      'mkv',
      'flv',
      'vob',
      'avi',
      'wmv',
      'm4p',
      'mpg',
      'mpeg',
      'aac',
      'ogg',
      'flac',
      'wav',
      'm4p',
      'wma',
    ], // audio, video, archive types
  },
];

const defaultSize = 104857600; // 100 Mb

export const checkMaxFileSize = file => {
  const { size, type } = file;
  const [, ext] = type.split('/');
  for (const fileFormat of fileFormats) {
    if (fileFormat.types.some(el => el === ext)) {
      if (size <= fileFormat.maxSize) {
        return true;
      }
      return false;
    }
  }
  if (size <= defaultSize) {
    return true;
  }
  return false;
};
