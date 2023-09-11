import ApplicationError from '../errors/ApplicationError.js';

const filenameRegex = /filename=['"]?(.*?[^'";\n]*)/;

const getFilename = (headers) => {
  // 'content-disposition': 'attachment; filename="Statement(s) Wed Mar 03 2021 - Wed Mar 03 2021.pdf"',
  const contentDisposition = headers['content-disposition'];
  if (!contentDisposition) {
    throw ApplicationError.unknown(`Can't get content-disposition header`);
  }

  // get matched filename
  const filename = filenameRegex.exec(contentDisposition)?.[1];
  if (!filename) {
    throw ApplicationError.unknown(`Can't get filename`);
  }

  return filename;
};

export default getFilename;
