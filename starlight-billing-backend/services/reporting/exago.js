import axios from 'axios';

import { EXAGO_URL, EXAGO_TOKEN } from '../../config.js';
import { ReportSettings } from '../../consts/reports.js';

const exagoRest = `${EXAGO_URL}ExagoWebApi/Rest/`;
const parametersUrl = 'Parameters/';
const settingsUrl = 'Settings';
const reportExecuteUrl = 'Reports/Execute/';
const reportsUrl = 'Reports/List';
const foldersUrl = 'Folders/';
const dataSourcesUrl = 'DataSources/';
const batchUrl = 'Batch/';
const selfServiceRolesUrl = 'Roles/selfService';

const dateParams = ['fromDate', 'toDate'];
const getValue = (key, value) => (dateParams.includes(key) ? new Date(value) : value);
const getConfig = sid => ({
  headers: {
    Accept: 'application/json',
    Authorization: `Basic ${EXAGO_TOKEN}`,
  },
  params: { sid },
});

const haulingDataSourceIds = [0, 1, 2, 4, 5, 7];
const recyclingDataSourceIds = [3];
const dataSourcePatch = (id, schema) => ({
  Url: dataSourcesUrl + id,
  Method: 'PATCH',
  Payload: { Schema: schema },
});

export const batchInit = async (
  ctx,
  { haulingSchema, recyclingSchema, isRecyclingBU, ...reportSessionData } = {},
  params = {},
  { userFolder, path, edit } = {},
) => {
  const data = [
    {
      Url: 'Sessions',
      Method: 'POST',
    },
  ];
  const recyclingSchemaName = isRecyclingBU
    ? `srn:${haulingSchema}:recycling:${reportSessionData?.businessUnitId}`
    : recyclingSchema;

  // if (haulingSchema && reportSessionData?.businessUnitId) {
  data.push(...haulingDataSourceIds.map(id => dataSourcePatch(id, haulingSchema)));
  // }

  data.push(...recyclingDataSourceIds.map(id => dataSourcePatch(id, recyclingSchemaName)));

  Object.entries({ ...params, ...reportSessionData })?.forEach(([key, value]) => {
    if (typeof value !== 'undefined') {
      data.push({
        Url: parametersUrl + key,
        Method: 'PATCH',
        Payload: { value: getValue(key, value) },
      });
    }
  });

  if (reportSessionData?.timeZone) {
    data.push({
      Url: settingsUrl,
      Method: 'PATCH',
      Payload: {
        General: {
          ClientTimeZoneName: `${reportSessionData?.timeZone}`,
        },
      },
    });
  }

  if (userFolder) {
    const folders = [
      {
        Name: `${haulingSchema}\\users\\${userFolder}`,
        ReadOnly: false,
        Propagate: true,
      },
    ];
    if (path) {
      folders.push({
        Name: path,
        ReadOnly: true,
        Propagate: true,
      });
    }
    data.push({
      Url: `${selfServiceRolesUrl}/Folders`,
      Method: 'PATCH',
      Payload: { Folders: folders },
    });
    data.push({
      Url: selfServiceRolesUrl,
      Method: 'PATCH',
      Payload: { IsActive: true },
    });
  }

  if (edit) {
    data.push({
      Url: selfServiceRolesUrl,
      Method: 'PATCH',
      Payload: { IsActive: true },
    });
    // disable save just for standard reports
    if (!userFolder) {
      data.push(
        {
          Url: `${parametersUrl}disableSave`,
          Method: 'PATCH',
          Payload: { value: 'yes' },
        },
        {
          Url: `${selfServiceRolesUrl}/Folders`,
          Method: 'PATCH',
          Payload: { IncludeAll: true },
        },
      );
    }
  }

  let session;
  try {
    session = await axios.post(exagoRest + batchUrl, data, {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${EXAGO_TOKEN}`,
      },
    });
  } catch (e) {
    ctx.logger.error(e, `init , ${e?.response?.data?.reason}`);
    throw new Error(`Failed to create session with params: ${JSON.stringify(params)}`);
  }

  return session?.data[0]?.ResponseContent;
};

export const invoiceInitSession = async (ctx, haulingSchema, tenantId, timeZoneInMs) => {
  // TODO patch more data source if needed here, recycling for example
  const data = [
    {
      Url: 'Sessions',
      Method: 'POST',
    },
    {
      Url: `${parametersUrl}tenantId`,
      Method: 'PATCH',
      Payload: { value: tenantId },
    },
    {
      Url: `${parametersUrl}timeZoneInMs`,
      Method: 'PATCH',
      Payload: { value: timeZoneInMs },
    },
    {
      Url: `${dataSourcesUrl}1`,
      Method: 'PATCH',
      Payload: { Schema: haulingSchema },
    },
  ];

  let session;
  try {
    session = await axios.post(exagoRest + batchUrl, data, {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${EXAGO_TOKEN}`,
      },
    });
  } catch (e) {
    ctx.logger.error(e, `init , ${e?.response?.data?.reason}`);
    throw new Error(`Failed to create invoice session`);
  }

  return session?.data[0]?.ResponseContent;
};

/**
 * path overrides folder + name
 */
export const getReportData = async (ctx, sid, { folder, name, type = 'pdf', path }) => {
  const data = {
    ReportPath: path ?? `${folder}${name}`,
    DataType: 'Data',
  };

  let session;
  try {
    session = await axios.post(exagoRest + reportExecuteUrl + type, data, getConfig(sid));
  } catch (e) {
    ctx.logger.error(e, `load , ${e?.response?.data?.reason}`);
    throw new Error(`Failed to load report`);
  }

  return session?.data;
};

export const getInvoiceData = async (ctx, sid, path, id) => {
  const type = 'pdf';
  const data = {
    ReportPath: path,
    DataType: 'Data',
    Filters: [
      {
        FilterText: 'Invoices.id',
        DataType: 'Integer',
        Operator: 0,
        Values: [id],
      },
    ],
  };

  let session;

  try {
    session = await axios.post(exagoRest + reportExecuteUrl + type, data, getConfig(sid));
  } catch (e) {
    ctx.logger.error(e, `load , ${e?.response?.data?.reason}`);
    throw new Error(`Failed to load report`);
  }

  return session?.data;
};

export const getReportDataAsStream = async (ctx, sid, { folder, name, type = 'pdf', path }) => {
  const data = {
    ReportPath: path ?? `${folder}${name}`,
    DataType: 'Data',
  };

  let session;
  try {
    session = await axios.post(exagoRest + reportExecuteUrl + type, data, {
      ...getConfig(sid),
      responseType: 'stream',
    });
  } catch (e) {
    ctx.logger.error(e, `load , ${e?.response?.data?.reason}`);
    throw new Error(`Failed to load report`);
  }

  return session.data; // is stream
  // return session?.data;
};

export const reports = async sid => {
  const response = await axios.get(exagoRest + reportsUrl, getConfig(sid));

  return response?.data;
};

export const existTenantInvoice = async (ctx, sid, schema) => {
  let response;

  try {
    response = await axios.get(
      `${exagoRest + foldersUrl + schema}/${ReportSettings.invoice.path}`,
      getConfig(sid),
    );
  } catch {
    // ignore because throw exception in case not existing folder
  }

  return response?.data?.Status === 'Exists';
};

export const existTenantWeightTicket = async (ctx, sid, schema, type) => {
  let response;
  try {
    response = await axios.get(
      `${exagoRest + foldersUrl + schema}/${ReportSettings[type].path}`,
      getConfig(sid),
    );
  } catch (e) {
    // ignore because throw exception in case not existing folder
  }

  return response?.data?.Status === 'Exists';
};

export const createTenantFolder = async (ctx, schema) => {
  const session = await batchInit(ctx);
  try {
    await axios.post(exagoRest + foldersUrl + schema, {}, getConfig(session.Id));
    await axios.post(`${exagoRest + foldersUrl + schema}/users`, {}, getConfig(session.Id));
    await axios.post(`${exagoRest + foldersUrl + schema}/reports`, {}, getConfig(session.Id));
  } catch (error) {
    ctx.logger.error(error, `Failed to create tenant folder ${schema}`);
  }

  return true;
};

export const createUserFolder = async (ctx, { schema, userEmail }) => {
  const session = await batchInit(ctx);
  try {
    await axios.post(
      `${exagoRest + foldersUrl + schema}/users/${encodeURIComponent(userEmail)}`,
      {},
      getConfig(session.Id),
    );
  } catch (error) {
    ctx.logger.error(error, `Failed to create user folder ${userEmail} for tenant ${schema}`);
  }

  return true;
};
