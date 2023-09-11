import R from 'ramda';
import _debug from 'debug';
import HTTPStatus from 'http-status';

import documents from '../tables/documents.js';
import workOrdersTable from '../tables/workorders.js';
import { unixTime } from '../utils/format.js';
import { APIError, NotFoundError } from '../services/error/index.js';
import { generatePdf } from '../services/pdf/index.js';
import universal from './universal.js';
import { create as noteCreate } from './wo-notes.js';
import Templates from './templates.js';
import WorkOrders from './workorders.js';
import Locations from './locations.js';

const debug = _debug('api:models:documents');

const TRUE = documents.literal('TRUE');

const byId = ({ id }) => (id ? documents.id.equals(id) : TRUE);

const bySlug = ({ slug }) => (slug ? documents.slug.equals(slug) : TRUE);

const byModifiedSince = ({ modifiedSince }) =>
  modifiedSince ? documents.modifiedDate.gt(unixTime(modifiedSince)) : TRUE;

export const findAll = R.curry((httpQuery, query) =>
  query(
    documents
      .select()
      .where(byId(httpQuery))
      .where(bySlug(httpQuery))
      .where(byModifiedSince(httpQuery))
      .order(documents.modifiedDate.desc),
  ),
);

const modelTypes = {
  TEMPLATE: 'template',
  WORK_ORDER: 'work order',
  LOCATION: 'location',
};
const models = {
  [modelTypes.TEMPLATE]: Templates,
  [modelTypes.WORK_ORDER]: WorkOrders,
  [modelTypes.LOCATION]: Locations,
};
const getItemById = async (itemId, query, type) => {
  if (!Object.values(modelTypes).includes(type)) {
    throw new Error(`Unresolved key "${type}" of models entities`);
  }
  const model = models[type];
  const item = await model.findById(itemId, query);
  if (!item) {
    throw new NotFoundError(`Requested ${type} is not found`);
  }
  return item;
};

const updateWorkOrderDocument = (id, documentId, query) =>
  query(workOrdersTable.update({ documentId }).where({ id }));

const getTemplateData = ({ template, workOrder, location1, location2, content }) => ({
  logo: template?.logo || 'https://cdn.starlightpro.com/starlight-logo-plain.png',
  address: template?.address || '',
  city: template?.city || '',
  state: template?.state || '',
  zipcode: template?.zipcode || '',
  phoneNumber: template?.phoneNumber || '',
  id: workOrder.id,
  customerName: workOrder.customerName,
  scheduledDate: workOrder.scheduledDate,
  poNumber: workOrder.poNumber || '',
  contactName: workOrder.contactName || '',
  contactNumber: workOrder.contactNumber || '',
  size: workOrder.size,
  action: workOrder.action,
  material: workOrder.material,
  permitNumber: workOrder.permitNumber || '',
  instructions: workOrder.instructions || '',
  location1name: location1.name,
  location2name: location2 && location2.name,
  acknowledgement: template?.acknowledgement || '',
  signature: content.signature,
  printedName: content.printedName,
  time: content.time,
});

export const findById = universal.findById(findAll);

const singular = universal.singular(documents, findById);

// eslint-disable-next-line complexity
export const create = R.curry(async (content, user, query) => {
  debug('create');
  if (!content.signature) {
    throw new APIError('Missing signature', HTTPStatus.BAD_REQUEST, true, false);
  }

  const { templateId, workOrderId } = content;

  try {
    const template = await getItemById(templateId, query, modelTypes.TEMPLATE);
    const workOrder = await getItemById(workOrderId, query, modelTypes.WORK_ORDER);

    const { locationId1, locationId2 } = workOrder;
    const location1 = await getItemById(locationId1, query, modelTypes.LOCATION);
    const location2 = locationId2 && (await getItemById(locationId2, query, modelTypes.LOCATION));

    const templateData = getTemplateData({
      template,
      workOrder,
      location1,
      location2,
      content,
    });
    const payload = {
      content: templateData,
    };
    const responseData = await generatePdf(payload);
    content.url = responseData.s3Url;
    content.driver = user.name;

    const notePayload = {
      workOrderId,
      type: 'SIGNED_DOC',
      note: { document: content.url },
    };
    await noteCreate(notePayload, user, query);

    const newDoc = await singular.create(R.omit(['signature', 'time'], content), user, query);
    await updateWorkOrderDocument(workOrderId, newDoc.id, query);
    return newDoc;
  } catch (error) {
    const isNotFound = error instanceof NotFoundError;
    if (isNotFound) {
      throw new APIError(
        `${error.message}. Please adjust your input.`,
        HTTPStatus.BAD_REQUEST,
        true,
        false,
      );
    }
    throw error;
  }
});

export const { remove } = singular;

export default {
  findAll,
  findById,
  create,
  remove,
};
