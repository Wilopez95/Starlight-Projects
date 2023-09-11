import puppeteer from 'puppeteer';

import { logger } from '../utils/logger.js';

let browser;

export const renderHtmlToPdf = async htmlText => {
  if (!browser) {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  }

  const page = await browser.newPage();

  page.once('error', async error => {
    logger.error(error, 'Error while loading page');
    await page.close();
  });

  await page.goto(`data:text/html;base64,${Buffer.from(htmlText).toString('base64')}`, {
    // We need to wait until all resources (for now only company logo) finish loading.
    waitUntil: 'networkidle0',
  });

  let pdfBuffer;
  let imageBuffer;
  try {
    pdfBuffer = await page.pdf({ printBackground: true });
    imageBuffer = await page.screenshot({ encoding: 'binary', type: 'png' });
  } catch (error) {
    logger.error(error, 'Error while rendering HTML to PDF');
    pdfBuffer = null;
    imageBuffer = null;
  }

  await page.close();

  return { pdf: pdfBuffer, preview: imageBuffer };
};
