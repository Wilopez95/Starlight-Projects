import axios from 'axios';

export const getWeightTicketFileName = (woNumber, extension) =>
  `Weight ticket for WO# ${woNumber}.${extension}`;

export const loadMediaFiles = async (mediaFiles, { convertToBase64 = false } = {}) => {
  const responses = await Promise.all(
    mediaFiles.map(({ url }) =>
      axios.get(url, {
        responseType: 'arraybuffer',
      }),
    ),
  );
  const attachments = responses.map(({ data, headers }, index) => {
    const buffer = Buffer.from(data);
    const base64 = convertToBase64 ? buffer.toString('base64') : '';
    return {
      type: headers['content-type'],
      content: convertToBase64 ? base64 : buffer,
      filename: mediaFiles[index].fileName,
      size: convertToBase64 ? (base64.length * 3) / 4 / 1024 ** 2 : buffer.byteLength,
    };
  });

  return attachments;
};
