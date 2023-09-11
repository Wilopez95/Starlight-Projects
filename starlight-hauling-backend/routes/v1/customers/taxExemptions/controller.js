import httpStatus from 'http-status';

import pick from 'lodash/fp/pick.js';
import isEmpty from 'lodash/fp/isEmpty.js';

import CustomerTaxExemptionsRepo from '../../../../repos/customerTaxExemptions.js';
import CustomerJobSiteTaxExemptionsRepo from '../../../../repos/customerJobSiteTaxExemptions.js';
import CustomerJobSiteRepo from '../../../../repos/customerJobSitePair.js';

import { storeFile, getUrl, deleteFileByUrl } from '../../../../services/mediaStorage.js';

import { generateId } from '../../../../utils/generateId.js';
import { INVALID_REQUEST } from '../../../../errors/codes.js';
import ApiError from '../../../../errors/ApiError.js';

import { MEDIA_STORAGE_KEY } from '../../../../consts/mediaStorage.js';
import allowMimeUtil from '../../../../utils/allowedMimeTypes.js';

const { allowedMimeTypes, isMimeTypeAllowed } = allowMimeUtil('png', 'jpeg', 'pdf');

const imageFieldDuplicatedError = new ApiError(
  'imageUrl and image found',
  INVALID_REQUEST,
  httpStatus.UNPROCESSABLE_ENTITY,
  'Both imageUrl and image fields found. Only one can be preset at a time.',
);

const getGroupExemptionData = pick([
  'id',
  'enabled',
  'authNumber',
  'imageUrl',
  'author',
  'timestamp',
  'nonGroup',
]);
const getNonGroupExemptionData = pick([
  'id',
  'enabled',
  'authNumber',
  'imageUrl',
  'author',
  'timestamp',
  'taxDistrictId',
]);

const setExemptionImageUrl = (exemption, url) => {
  if (exemption.imageUrl && url) {
    throw imageFieldDuplicatedError;
  }

  if (url) {
    exemption.imageUrl = url;
  }
};

const uploadTaxExemptionImages = async ({
  schemaName,
  customerId,
  customerJobSiteId,
  files,
  data,
}) => {
  if (isEmpty(files)) {
    return null;
  }

  if (!files.every(isMimeTypeAllowed)) {
    throw ApiError.invalidMimeType(allowedMimeTypes);
  }

  const storageKey = customerJobSiteId
    ? MEDIA_STORAGE_KEY.customerJobSiteTaxExemptionImage
    : MEDIA_STORAGE_KEY.customerTaxExemptionImage;
  const groupedExemptionFile = 'groupFile';
  const promises = [];
  const urls = {};

  files.forEach(file => {
    const isGroupedExemptionFile = file.fieldName === groupedExemptionFile;

    let extension;
    let isPdf = false;
    if (file.type.startsWith('application/pdf')) {
      extension = 'pdf';
      isPdf = true;
    } else if (file.type.startsWith('image/png')) {
      extension = 'png';
    } else {
      extension = 'jpeg';
    }

    const fileName = `${generateId()}.${extension}`;

    const meta = {
      customerJobSiteId,
      customerId,
      taxDistrictId: isGroupedExemptionFile ? undefined : file.fieldName,
      fileName,
      isPdf,
      type: file.type,
    };

    promises.push(storeFile(schemaName, storageKey, meta, file));

    const newUrl = getUrl(schemaName, storageKey, meta);
    urls[file.fieldName] = newUrl;
  });

  await Promise.all(promises);

  setExemptionImageUrl(data, urls[groupedExemptionFile]);

  data.nonGroup.forEach(item => {
    setExemptionImageUrl(item, urls[item.taxDistrictId]);
  });

  return urls;
};

export const getCustomerTaxExemptions = async ctx => {
  const { customerId } = ctx.params;

  const result = await CustomerTaxExemptionsRepo.getInstance(ctx.state).getBy({
    condition: { customerId },
  });

  ctx.sendObj(result, httpStatus.OK);
};

export const updateCustomerTaxExemptions = async ctx => {
  const { schemaName } = ctx.state.user;
  const { customerId } = ctx.params;
  const { files } = ctx.request;
  const data = getGroupExemptionData(ctx.request.body);
  data.nonGroup = data.nonGroup?.map(getNonGroupExemptionData);

  let customerTaxExemptions;
  let imageUrls = {};
  try {
    imageUrls = await uploadTaxExemptionImages({
      schemaName,
      customerId,
      files,
      data,
    });

    customerTaxExemptions = await CustomerTaxExemptionsRepo.getInstance(ctx.state).upsert({
      data: { customerId, ...data },
    });
  } catch (error) {
    if (imageUrls) {
      Object.values(imageUrls).forEach(url =>
        deleteFileByUrl(url).catch(err => ctx.logger.error(err, `Could not remove image ${url}`)),
      );
    }
    throw error;
  }

  ctx.sendObj(customerTaxExemptions);
};

export const getCustomerJobSiteTaxExemptions = async ctx => {
  const { customerId, jobSiteId } = ctx.params;

  const customerJobSitePair = await CustomerJobSiteRepo.getInstance(ctx.state).getBy({
    condition: { customerId, jobSiteId },
  });

  if (!customerJobSitePair) {
    throw ApiError.notFound('CustomerJobSite Pair not found');
  }

  const { id: customerJobSiteId } = customerJobSitePair;

  const result = await CustomerJobSiteTaxExemptionsRepo.getInstance(ctx.state).getBy({
    condition: { customerJobSiteId },
  });

  ctx.sendObj(result, httpStatus.OK);
};

export const updateCustomerJobSiteTaxExemptions = async ctx => {
  const { schemaName } = ctx.state.user;
  const { customerId, jobSiteId } = ctx.params;
  const { files } = ctx.request;
  const data = getGroupExemptionData(ctx.request.body);
  data.nonGroup = data.nonGroup?.map(getNonGroupExemptionData);

  const customerJobSitePair = await CustomerJobSiteRepo.getInstance(ctx.state).getBy({
    condition: { customerId, jobSiteId },
  });

  if (!customerJobSitePair) {
    throw ApiError.notFound('CustomerJobSite Pair not found');
  }

  const { id: customerJobSiteId } = customerJobSitePair;
  let customerJobSiteTaxExemptions;
  let imageUrls = {};

  try {
    imageUrls = await uploadTaxExemptionImages({
      schemaName,
      customerJobSiteId,
      files,
      data,
    });

    customerJobSiteTaxExemptions = await CustomerJobSiteTaxExemptionsRepo.getInstance(
      ctx.state,
    ).upsert({
      data: { customerJobSiteId, ...data },
    });
  } catch (error) {
    if (imageUrls) {
      Object.values(imageUrls).forEach(url =>
        deleteFileByUrl(url).catch(err => ctx.logger.error(err, `Could not remove image ${url}`)),
      );
    }
    throw error;
  }

  ctx.sendObj(customerJobSiteTaxExemptions);
};
