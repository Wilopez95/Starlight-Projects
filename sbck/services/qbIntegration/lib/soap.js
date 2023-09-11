import { readFile } from 'fs/promises';

/**
 * A SOAP client and server
 * for Node.js
 *
 * https://github.com/vpulim/node-soap
 */
import soap from 'soap';

import { logger } from '../../../utils/logger.js';
import { START_QB_SOAP_SERVER } from '../../../config.js';
import webService from './webService.js';

/**
 * An HTTP server that will be used
 * to listen for SOAP requests.
 */

/**
 * A constant for the WSDL filename.
 * @type {string}
 */
const WSDL_FILENAME = 'qbws.wsdl';

/**
 * Fetches the WSDL file for the SOAP service.
 * @returns {string} contents of WSDL file
 */
const buildWsdl = async () => {
  const wsdl = await readFile(`./services/qbIntegration/lib/${WSDL_FILENAME}`, 'utf8');
  return wsdl;
};

export default class SoapHandler {
  constructor() {
    this.webService = webService;
  }

  async run(server) {
    if (START_QB_SOAP_SERVER === 'true') {
      const wsdl = await buildWsdl();
      this.soapServer = soap.listen(server, '/api/billing/wsdl', this.webService.service, wsdl);
      logger.info('Quickbooks SOAP Server started');
    }
  }

  setQBXMLHandler(qbXMLHandler) {
    this.webService.setQBXMLHandler(qbXMLHandler);
  }
}
