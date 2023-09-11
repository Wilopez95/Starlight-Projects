import axios from 'axios';
import { PDFDocument } from 'pdf-lib';

import { logger } from '../utils/logger.js';

export const mergePdfs = async (pdfUrls, title) => {
  const mergedDocument = await PDFDocument.create();
  mergedDocument.setTitle(title);

  for (const url of pdfUrls) {
    let pdfFile;
    try {
      pdfFile = await axios.get(url, { responseType: 'arraybuffer' });
    } catch (error) {
      logger.error(error, `load , ${error?.response?.data?.reason}`);
      throw new Error(`Failed to download pdf`);
    }

    const document = await PDFDocument.load(pdfFile.data);

    const copiedPages = await mergedDocument.copyPages(document, document.getPageIndices());
    copiedPages.forEach(page => mergedDocument.addPage(page));
  }

  const buffer = await mergedDocument.save();

  return Buffer.from(buffer);
};
