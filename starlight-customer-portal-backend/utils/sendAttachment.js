import httpStatus from 'http-status';
import getFilename from './getFilename.js';

const sendAttachment = ({ ctx, data, headers }) => {
  const filename = getFilename(headers);
  const buffer = Buffer.from(data);

  ctx.attachment(filename);
  ctx.status = httpStatus.OK;
  ctx.body = buffer;
};

export default sendAttachment;
