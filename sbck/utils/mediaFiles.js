import axios from 'axios';

export const getWeightTicketFileName = (woNumber, extension) => {
  /*
   * Extension is not used in certain cases because it returns a weight ticket
   * with a file name that makes gmail think it is spam and therefore blocked.
   * JIRA R16-42
   * Steven 8/31/22
   */
  return extension
    ? `Weight-ticket-for-WorkOrder-${woNumber}.${extension}`
    : `Weight-ticket-for-WorkOrder-${woNumber}`;
};

export const loadMediaFiles = async (mediaFiles, { convertToBase64 = false } = {}) => {
  const responses = await Promise.all(
    mediaFiles.map(({ url }) =>
      axios.get(url, {
        responseType: 'arraybuffer',
      }),
    ),
  );

  return responses.map(({ data, headers }, index) => {
    const buffer = Buffer.from(data);
    const base64 = convertToBase64 ? buffer.toString('base64') : '';
    const ext = headers['content-type'].match(/\/(.*)/)[1];
    if (mediaFiles[index].fileName[mediaFiles[index].fileName.length - 4] !== '.') {
      mediaFiles[index].fileName += `.${ext}`;
    }
    return {
      type: headers['content-type'],
      content: convertToBase64 ? base64 : buffer,
      filename: mediaFiles[index].fileName,
      size: convertToBase64 ? (base64.length * 3) / 4 / 1024 ** 2 : buffer.byteLength,
    };
  });
};

export const loadMediaFile = async ({ url, fileName }, { convertToBase64 = false } = {}) => {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  });

  const buffer = Buffer.from(response.data);
  const base64 = convertToBase64 ? buffer.toString('base64') : '';

  return {
    type: response.headers['content-type'],
    content: convertToBase64 ? base64 : buffer,
    filename: fileName,
    size: convertToBase64 ? (base64.length * 3) / 4 / 1024 ** 2 : buffer.byteLength,
  };
};
