import nock from 'nock';

import { BASE_URL } from './config.js';

const URI = '/reports/download-materials';

const defaultInput = {
  customerId: 1,

  jobSiteId: 1,
  allActiveOnly: true,

  fromDate: '2021-07-03',
  toDate: '2021-08-03',
};
const defaultOutput = {
  pdfUrl: 'https://starlight-dev1-files.s3.amazonaws.com/reports/stark/1.pdf',
};
const defaultStatus = 200;

export const billingGetMaterialsReportData = (
  { input = defaultInput, output = defaultOutput, status = defaultStatus } = {},
  baseUrl = BASE_URL,
) => nock(baseUrl).get(URI).query(input).reply(status, output);

export default billingGetMaterialsReportData;
