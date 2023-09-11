/*
 * Web-Service.js
 *
 * This class builds the SOAP
 * web-service methods called by
 * Quickbooks Web Connector.
 */

/**
 * A reference to the semvar library.
 * https://www.npmjs.com/package/semver
 *
 * @type {SemVer}
 */
import semver from 'semver';

/**
 * A library to generate UUIDs
 */
import { v1 as uuidv1 } from 'uuid';
import xml2js from 'xml2js';
import { subDays, endOfDay } from 'date-fns';

import { logger } from '../../../utils/logger.js';
import { calculateRangeTo, calculateRangeFrom } from '../utils/helpers.js';
import { QBConfiguration, QBIntegrationLog } from '../../../models/index.js';
import { compareHashes } from '../utils/auth.js';
import { LogType } from '../../../consts/qbLogTypes.js';

// redis to save qb sessions
import { client as redis } from '../../redis.js';

const parseXML = string => {
  return new Promise((res, rej) => {
    return xml2js.parseString(string, (err, result) => {
      if (err) {
        return rej(err);
      }
      return res(result);
    });
  });
};

/**
 * A constant for the minimum supported
 * version of the Quickbooks Web Connector.
 * @type {string}
 */
const MIN_SUPPORTED_VERSION = '1.0.0';

/**
 * A constant for the recommended version
 * of Quickbooks Web Connector.
 * @type {string}
 */
const RECOMMENDED_VERSION = '2.0.1';
const NoSessionFoundErrorMessage = 'No session found';
const sessionTTL = 10 * 60; // in minutes
const saveSession = async (ticket, session) => {
  await redis.set(ticket, JSON.stringify(session), 'ex', sessionTTL);
};

/**
 * A delegate to handle fetching
 * and receiving qbXML requests and responses.
 *
 * @type {Object}
 */
let qbXMLHandler = {};

/**
 * The SOAP web service functions
 * and their defintions.
 */
const webService = {
  QBWebConnectorSvc: {
    QBWebConnectorSvcSoap: {},
  },
};

const getSession = async ticket => {
  const sessionStr = await redis.get(ticket);
  let session;
  try {
    const {
      id,
      tenantId,
      surchargesTotal,
      paymentsTotal,
      invoicesTotal,
      taxesTotal,
      adjustmentsTotal,
      finChargesTotal,
      creditMemosTotal,
      writeOffsTotal,
      reversedPaymentsTotal,
      counter,
      ...rest
    } = JSON.parse(sessionStr);
    session = {
      id: Number(id),
      tenantId: Number(tenantId),
      surchargesTotal: Number(surchargesTotal) || 0,
      paymentsTotal: Number(paymentsTotal) || 0,
      invoicesTotal: Number(invoicesTotal) || 0,
      taxesTotal: Number(taxesTotal) || 0,
      adjustmentsTotal: Number(adjustmentsTotal) || 0,
      finChargesTotal: Number(finChargesTotal) || 0,
      creditMemosTotal: Number(creditMemosTotal) || 0,
      writeOffsTotal: Number(writeOffsTotal) || 0,
      reversedPaymentsTotal: Number(reversedPaymentsTotal) || 0,
      counter: Number(counter) || 0,
      ...rest,
    };
  } catch (err) {
    logger.error(err, `Can not parse session for ticket: ${ticket} json: ${sessionStr}`);
  }
  if (!session) {
    throw new Error(`${NoSessionFoundErrorMessage} with ticket: ${ticket}`);
  }
  return session;
};

const setSessionError = async (ticket, session, error) => {
  try {
    if (session) {
      session.lastError = error.message || error;
      await redis.set(ticket, JSON.stringify(session), 'ex', sessionTTL);
    }
  } catch (err) {
    logger.error(
      err,
      `Unable to set error for ticket: ${ticket} prevError: ${error.message || error}`,
    );
  }
};

/**
 * Communicates this web service's version
 * number to the QBWC.
 * @return the version of this web service
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.serverVersion = (/*args*/) => {
  const returnValue = '0.2.0';
  return {
    serverVersionResult: { string: returnValue },
  };
};

/**
 * Allows the web service to evaluate the current
 * QBWebConnector version
 * @return
 * - `NULL` or '' (empty string) - if you want QBWC to proceed.
 * - 'W:<any text>' - prompts a WARNING to the user.
 * - 'E:<any text>' - prompts an ERROR to the user.
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.clientVersion = args => {
  const strVersions = args.strVersion.split('.');
  let returnValue = '';
  const qbwcVersion = `${strVersions[0]}.${strVersions[1]}.${strVersions[2]}`;

  // Check if qbwcVersion is less than minimum supported.
  if (semver.lt(qbwcVersion, MIN_SUPPORTED_VERSION)) {
    returnValue = 'E:You need to upgrade your QBWebConnector';
  }
  // Check if qbwcVersion is less than recommended version.
  else if (semver.lt(qbwcVersion, RECOMMENDED_VERSION)) {
    returnValue = 'W:It is recommended that you upgrade your QBWebConnector';
  }
  return {
    clientVersionResult: { string: returnValue },
  };
};

/**
 * Allows for the web service to authenticate the user
 * QBWC is using and to specify the company file to be used in the session.
 * @return - array
 * - [0] index 0 is always a UUID for the session
 * - [1] NONE        - if there are no requests to process
 *       ''          - if QBWC is to use the currently open company file
 *       <file path> - the full path to the company file that should be used
 *       nvu         - the username and password were invalid
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.authenticate = async (
  args,
  callback,
  headers,
  req,
  res,
) => {
  const statusCode = res.statusCode;
  const ticket = uuidv1();
  const authReturn = [
    ticket,
    'nvu', // The username and password sent from QBWC do not match was is set on the server.
  ];
  const integrationId = Number(args.strUserName.trim());
  let session;
  let configuration;
  try {
    configuration = await QBConfiguration.getBy({
      condition: { id: integrationId },
      fields: ['*'],
    });
    // DISABLED TEMPORARILY JGG
    // session = await saveSession(ticket, { tenantId: configuration.tenantId, id: integrationId });
    // if (!session) {
    //   throw new Error(`There is no configuration for tenantId: ${configuration?.tenantId}`);
    // }
    const auth = await compareHashes(args.strPassword.trim(), configuration.password);
    if (!auth) {
      throw new Error('Invalid password');
    }
    // Check if qbXMLHandler responds to method.
    if (typeof qbXMLHandler.fetchRequests === 'function') {
      const { requests, total } = await qbXMLHandler.fetchRequests(args, statusCode);

      if (requests?.length === 0) {
        authReturn[1] = 'NONE';
      } else {
        await saveSession(ticket, {
          ...session,
          ...total,
          requestQueue: requests,
          tenantId: configuration.tenantId,
          id: integrationId,
        });
        /**
         * Pass here the path to the company file that
         * Quickbooks should load. Leave an empty
         * String to use the file Quickbooks currently has open.
         * @type {string}
         */
        authReturn[1] = '';
      }
    } else {
      // Fallback to 'NONE'
      authReturn[1] = 'NONE';
    }
  } catch (err) {
    qbXMLHandler.didReceiveError(err, 'authenticate', {
      ...session,
      tenantId: configuration.tenantId,
      statusCode,
    });
    await setSessionError(ticket, session, err);
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    return {
      authenticateResult: { string: authReturn },
    };
  }
};

/**
 * Sends any qbXML commands to be executes to the
 * QBWC client. This method is called continuously until it
 * receives an empty string.
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.sendRequestXML = async ({ ticket }) => {
  let request = '';
  let session;
  try {
    session = await getSession(ticket);
    // eslint-disable-next-line prefer-const
    let { requestQueue, counter } = session ?? {};
    if (counter < requestQueue?.length) {
      request = requestQueue[counter];
      counter += 1;
    } else {
      counter = 0;
    }
    await saveSession(ticket, { ...session, counter });
  } catch (err) {
    qbXMLHandler.didReceiveError(err, 'sendRequestXML', session);
    await setSessionError(ticket, session, err);
  }
  return {
    sendRequestXMLResult: { string: request },
  };
};

/**
 * Called after QBWC has run a qbXML command
 * and has returned a response.
 * @return {Number} the percentage of requests complete.
 * - Greater than 0 - more requests to send
 * - 100 - Done; no more requests to process
 * - Less than 0 - An error occurred
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.receiveResponseXML = async ({
  response,
  hresult,
  message,
  ticket,
}) => {
  let returnValue = 0;
  let percentage = 0;
  let session;
  try {
    session = await getSession(ticket);
    let error, errorMessage;
    if (response) {
      try {
        const parsedResponse = await parseXML(response);
        const preParsed = parsedResponse.QBXML.QBXMLMsgsRs[0];
        const command = Object.keys(preParsed)[0];
        const errorObject = preParsed[command][0].$;
        error = errorObject.statusSeverity === 'Error';
        errorMessage = errorObject.statusMessage;
      } catch (err) {
        logger.error(err, `Error while parsing QB response: ${err.message || err} ${response}`);
        await setSessionError(ticket, session, err);
      }
    }

    if (error || hresult) {
      // if there was an error
      // the web service should return a
      // negative value.

      const messageError = message || errorMessage || hresult;
      logger.error(session, `Error with QB integration: ${messageError}`);
      await setSessionError(ticket, session, error);
      returnValue = -1;

      if (typeof qbXMLHandler.didReceiveError === 'function') {
        await qbXMLHandler.didReceiveError(
          { message: error },
          'receiveResponseXML:received',
          session,
        );
      }
    } else {
      if (typeof qbXMLHandler.handleResponse === 'function') {
        qbXMLHandler.handleResponse(response, session.id);
      }
      const { requestQueue, counter } = session;

      percentage = requestQueue.length ? (counter * 100) / requestQueue.length : 100;
      if (percentage >= 100) {
        // There are no more requests.
        // Reset the counter.
        session.counter = 0;
        await saveSession(ticket, session);
      }
      //QBWC throws an error if the return value contains a decimal
      returnValue = Number(percentage || 0).toFixed();
    }
  } catch (err) {
    qbXMLHandler.didReceiveError(err, 'receiveResponseXML', session);
    await setSessionError(ticket, session, err);
  }

  return {
    receiveResponseXMLResult: { int: returnValue },
  };
};

/**
 * Called when there is an error connecting to QB.
 * @return 'DONE' to abort or '' to retry.
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.connectionError = async ({
  message,
  ticket,
}) => {
  const returnValue = 'DONE';
  let session;
  try {
    session = await getSession(ticket);
    setSessionError(ticket, session, message);
    logger.debug(
      session,
      `Error with QB integration: connectionError ticket: ${ticket} message: ${message}`,
    );
  } catch (err) {
    qbXMLHandler.didReceiveError(err, 'connectionError', session);
    await setSessionError(ticket, session, err);
  }
  return {
    connectionErrorResult: { string: returnValue },
  };
};

/**
 * Called when there is an error connecting to QB.
 * Currently just saves off any errors and returns the latest one.
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.getLastError = async ({ ticket }) => {
  let returnValue = 'Unknown error';
  let session;
  try {
    session = await getSession(ticket);
    logger.debug(
      session,
      `Error with QB integration: getLastError ticket: ${ticket} lastError: ${session?.lastError}`,
    );
    if (session.lastError) {
      returnValue = session.lastError;
    }
  } catch (err) {
    qbXMLHandler.didReceiveError(err, 'getLastError', session);
    await setSessionError(ticket, session, err);
  }
  return {
    getLastErrorResult: { string: returnValue },
  };
};

/**
 * Tells QBWC is finished with the session.
 * @return 'OK'
 */
webService.QBWebConnectorSvc.QBWebConnectorSvcSoap.closeConnection = async ({ ticket }) => {
  //HERE JGG
  const returnValue = 'OK';
  let session;
  try {
    session = await getSession(ticket);
    if (session && !session.lastError && session.requestQueue.length) {
      const { lastSuccessfulIntegration, integrationBuList, dateToAdjustment } =
        await QBConfiguration.getBy({
          condition: { tenantId: session.tenantId, id: session.id },
          fields: ['id', 'lastSuccessfulIntegration', 'integrationBuList', 'dateToAdjustment'],
        });
      await QBConfiguration.updateLastSuccessfulIntegration({
        condition: { tenantId: session.tenantId, id: session.id },
        data: {
          lastSuccessfulIntegration: endOfDay(subDays(new Date(), dateToAdjustment)).toISOString(),
        },
      });
      const rangeFrom = calculateRangeFrom(lastSuccessfulIntegration);
      const rangeTo = calculateRangeTo(dateToAdjustment);
      await QBIntegrationLog.createOne({
        data: {
          type: LogType.INFO,
          description: 'QB integration was successful',
          surchargesTotal: session.surchargesTotal,
          paymentsTotal: session.paymentsTotal,
          invoicesTotal: session.invoicesTotal,
          taxesTotal: session.taxesTotal,
          adjustmentsTotal: session.adjustmentsTotal,
          finChargesTotal: session.finChargesTotal,
          creditMemosTotal: session.creditMemosTotal,
          writeOffsTotal: session.writeOffsTotal,
          reversedPaymentsTotal: session.reversedPaymentsTotal,
          configurationId: session.id,
          tenantId: session.tenantId,
          integrationBuList,
          lastSuccessfulIntegration,
          dateToAdjustment,
          rangeFrom,
          rangeTo,
        },
      });
    } else {
      logger.debug(
        session,
        `Error with QB integration: closeConnection: ${ticket} lastError: ${session?.lastError}`,
      );
    }
    await redis.del(ticket);
  } catch (err) {
    qbXMLHandler.didReceiveError(err, 'closeConnection', session);
  }
  return {
    closeConnectionResult: { string: returnValue },
  };
};

export default {
  service: webService,
  setQBXMLHandler: xmlHandler => {
    qbXMLHandler = xmlHandler;
  },
};
