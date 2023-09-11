const mimeToExtension: Record<string, string> = {
  'image/png': '.png',
  'image/webp': '.webp',
  'image/jpeg': '.jpeg',
  'application/pdf': '.pdf',
};

export const downloadFile = (blob: Blob, contentType: string, contentDispositionHeader: string) => {
  let fileName = contentDispositionHeader.split('filename=')?.[1]?.replace(/"/g, '');

  if (!fileName) {
    const extension = mimeToExtension[contentType] ?? '';

    fileName = `file${extension}`;
  }

  const objUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objUrl;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(objUrl);
};
