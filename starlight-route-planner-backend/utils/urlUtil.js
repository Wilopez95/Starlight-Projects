import { URL } from 'url';

export const getFilePathFromUrl = url => new URL(url).pathname.slice(1);

export const getFilenameFromUrl = url => {
  // url can look like 'http://.../rec_tenant-recycling-1/weight-ticket-66.pdf?AWSAccessKeyId=sdfasewr&Expires=3242342&Signature=SSD3242'
  const urlParsed = new URL(url);
  const filename = urlParsed.pathname.split('/').pop(); // last fragment before query params

  return filename;
};
