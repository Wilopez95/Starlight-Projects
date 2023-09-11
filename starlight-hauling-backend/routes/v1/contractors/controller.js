import httpStatus from 'http-status';
import pick from 'lodash/pick.js';

import CompanyRepo from '../../../repos/company.js';
import ContactRepo from '../../../repos/contact.js';
import JobSiteRepo from '../../../repos/jobSite.js';
import ContractorRepo from '../../../repos/contractor.js';
import MaterialRepo from '../../../repos/material.js';
import EquipmentItemRepo from '../../../repos/equipmentItem.js';
import BillableServiceRepo from '../../../repos/billableService.js';
import CustomRatesGroupRepo from '../../../repos/customRatesGroup.js';
import CustomerRepo from '../../../repos/customer.js';
import BusinessLineRepo from '../../../repos/businessLine.js';
import GlobalRatesServiceRepo from '../../../repos/globalRatesService.js';
import CustomGroupRatesServiceRepo from '../../../repos/customRatesGroupService.js';
import OrderRequestRepo from '../../../repos/orderRequest.js';
import NotificationRepo from '../../../repos/notification.js';
import OrderRepo from '../../../repos/order.js';
import MediaFileRepo from '../../../repos/mediaFile.js';
import customerJobSitePairRepo from '../../../repos/customerJobSitePair.js';
import PurchaseOrderRepo from '../../../repos/purchaseOrder.js';
import ChatMessagesRepo from '../../../repos/chatMessages.js';
import ChatRepo from '../../../repos/chat.js';

import { getCoordinatesByAddress } from '../../../services/mapbox.js';
import * as billingService from '../../../services/billing.js';
import * as routePlannerPublisher from '../../../services/routePlanner/publishers.js';
import { emitToRoom, getCsrIdsFromRoom } from '../../../services/socketHandlers/chat/handler.js';

import { mathRound2 } from '../../../utils/math.js';

import ApiError from '../../../errors/ApiError.js';

import { BUSINESS_LINE_TYPE } from '../../../consts/businessLineTypes.js';
import { PAYMENT_METHOD } from '../../../consts/paymentMethods.js';
import { ORDER_REQUEST_STATUS } from '../../../consts/orderRequestStatuses.js';
import { ORDER_STATUS } from '../../../consts/orderStatuses.js';
import { NOTIFICATION_TYPE, NOTIFICATION_TITLE } from '../../../consts/notifications.js';
import { ITEMS_PER_PAGE } from '../../../consts/limits.js';
import { CHAT_STATUS } from '../../../consts/chatStatuses.js';

const creditCardGateway = 'CARDCONNECT';

const combineTwoLinesString = (str1, str2) =>
  // eslint-disable-next-line no-nested-ternary
  str1 ? (str2 ? `${str1}, ${str2}` : str1) : undefined;

const getProfileInfo = user => ({
  contactId: user.contact.id,
  ...pick(user.contact, ['firstName', 'lastName']),
  ...pick(user, ['email', 'imageUrl', 'tocAccepted']),
  mobile: user?.mobile ?? user.contact?.phoneNumbers?.[0]?.number,
  businessUnitId: user?.customer?.businessUnitId,
});

const zeroResults = pageItemMax => ({
  pageItemMax,
  pageNumber: 0,
  pageItemCount: 0,
  totalItemCount: 0,
});

export const getCompanyInfo = async ctx => {
  const { tenantId, userId } = ctx.state.user;

  const [company, user] = await Promise.all([
    CompanyRepo.getInstance(ctx.state).getWithTenant({ condition: { tenantId } }),
    ContractorRepo.getInstance(ctx.state).getByWithContact({
      condition: { id: userId },
      withCustomer: true,
    }),
  ]);

  const companyInfo = {
    companyName: combineTwoLinesString(company?.companyNameLine1, company?.companyNameLine2),
    billingAddress: combineTwoLinesString(
      company?.mailingAddressLine1,
      company?.mailingAddressLine2,
    ),
    billingCity: company?.mailingCity,
    billingState: company?.mailingState,
    billingZip: company?.mailingZip,
    tenantName: company?.tenant.legal_name,
    tenantAddress1: company?.physicalAddressLine1,
    tenantAddress2: company?.physicalAddressLine2,
    tenantPhone: company?.phone,

    requirePO: !!user.customer.poRequired,
    allowOnAccount: !!user.customer.onAccount,
    creditCardGateway,
  };

  if (company?.physicalAddressLine1) {
    const physicalAddressFields = [
      'physicalAddressLine1',
      'physicalAddressLine2',
      'physicalCity',
      'physicalState',
      'physicalZip',
    ];

    const address = Object.values(pick(company, physicalAddressFields)).filter(Boolean).join(', ');

    try {
      const { coordinates } = await getCoordinatesByAddress(address);
      [companyInfo.centerLongitude, companyInfo.centerLatitude] = coordinates;
    } catch (error) {
      ctx.logger.error(error, 'Failed forward geocoding for Company Physical Address');
    }
  }

  ctx.status = httpStatus.OK;
  ctx.body = { companyInfo, profileInfo: user ? getProfileInfo(user) : null };
};

const mapContact = contact => ({
  contactId: contact.id,
  ...pick(contact, ['firstName', 'lastName', 'email']),
  mobile: contact?.mobile ?? contact?.phoneNumbers?.[0]?.number,
  imageUrl: contact?.contractor?.imageUrl ?? undefined,
});

export const getCustomerContacts = async ctx => {
  const { customerId } = ctx.state.user;
  const { activeOnly, contactId, pageItemMax = 100 } = ctx.request.validated.query;
  const condition = { customerId };
  activeOnly && (condition.active = true);
  contactId && (condition.id = contactId);

  const contacts = await ContactRepo.getInstance(ctx.state).getAllPaginated({
    condition,
    withContractor: true,
    limit: Number(pageItemMax),
    skip: 0,
  });

  ctx.status = httpStatus.OK;
  ctx.body = {
    contacts: contacts?.map(mapContact) || [],
  };
};

export const updateProfile = async ctx => {
  const { userId, contactId } = ctx.state.user;
  const data = ctx.request.validated.body;
  data.contactId = contactId;

  await ContractorRepo.getInstance(ctx.state).updateProfile({
    condition: { id: userId },
    data,
  });

  const user = await ContractorRepo.getInstance(ctx.state).getByWithContact({
    condition: { id: userId },
  });

  ctx.status = httpStatus.OK;
  ctx.body = { profileInfo: user ? getProfileInfo(user) : null };
};

function mapCreditCard(customerId, cc) {
  return {
    cardId: cc.id,
    customerId,
    active: cc.active,
    creditCardGateway,
    cardToken: cc?.ccAccountToken,
    nickName: cc?.cardNickname,
    ownerName: cc?.nameOnCard,
    brand: cc.cardType,
    number: cc.cardNumberLastDigits,
    expireMonth: cc.expirationDate.slice(0, 2),
    expireYear: `20${cc.expirationDate.slice(2)}`,
    billingAddress: cc?.addressLine1,
    billingAddress2: cc?.addressLine2 || undefined,
    billingCity: cc?.city,
    billingState: cc?.state,
    billingZip: cc?.zip,
    saveCard: true,
  };
}

export const getCustomerCreditCards = async ctx => {
  const { customerId } = ctx.state.user;
  const { activeOnly } = ctx.request.validated.query;

  const creditCards = await billingService.getCustomerCc(ctx, {
    customerId,
    activeOnly: !!activeOnly,
  });

  ctx.status = httpStatus.OK;
  ctx.body = { cards: creditCards?.map(mapCreditCard.bind(null, customerId)) || [] };
};

export const addCustomerCreditCard = async ctx => {
  const { customerId } = ctx.state.user;
  const {
    number,
    ownerName,
    expireMonth,
    expireYear,
    billingAddress,
    billingAddress2,
    billingState,
    billingCity,
    billingZip,
    cvv,
    // saveCard,
    // brand,
  } = ctx.request.validated.body;

  const data = {
    isContractor: true,
    active: true,

    nameOnCard: ownerName,
    cardNumber: number,
    expirationDate: `${expireMonth}${expireYear.slice(2)}`,

    addressLine1: billingAddress,
    addressLine2: billingAddress2 || undefined,
    city: billingCity,
    state: billingState,
    zip: billingZip,
    cvv,
  };

  const cc = await billingService.addCustomerCc(ctx, {
    customerId,
    data,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = { card: cc ? mapCreditCard(customerId, cc) : null };
};

export const updateCustomerCreditCard = async ctx => {
  const { customerId } = ctx.state.user;
  const {
    cardId,
    // brand,
    ownerName,
    expireMonth,
    expireYear,
    billingAddress,
    billingAddress2,
    billingState,
    billingCity,
    billingZip,
    active,
  } = ctx.request.validated.body;

  const data = {
    isContractor: true,
    nameOnCard: ownerName,
    expirationDate: `${expireMonth}${expireYear.slice(2)}`,

    addressLine1: billingAddress,
    addressLine2: billingAddress2 || undefined,
    city: billingCity,
    state: billingState,
    zip: billingZip,

    active: !!active,
  };

  const cc = await billingService.updateCustomerCc(ctx, {
    customerId,
    id: cardId,
    data,
  });

  ctx.status = httpStatus.OK;
  ctx.body = { card: cc ? mapCreditCard(customerId, cc) : null };
};

const mapJobSite = jobSite => ({
  jobSiteId: jobSite.originalId ?? jobSite.id,
  active: true,
  address1: jobSite.address?.addressLine1 ?? jobSite.addressLine1,
  address2: jobSite.address?.addressLine2 ?? jobSite.addressLine2,
  city: jobSite.address?.city ?? jobSite.city,
  state: jobSite.address?.state ?? jobSite.state,
  zip: jobSite.address?.zip ?? jobSite.zip,
  longitude: jobSite.coordinates[0],
  latitude: jobSite.coordinates[1],
  contact: jobSite.contact ? mapContact(jobSite.contact) : undefined,
  contactId: jobSite.contact ? jobSite.contact.id : jobSite.contactId || undefined,
  media: Array.isArray(jobSite?.media) ? jobSite.media : [],
  purchaseOrder: jobSite.purchaseOrderId,
});

export const createJobSite = async ctx => {
  const { schemaName, customerId } = ctx.state.user;
  const {
    address1,
    address2,
    state,
    city,
    zip,
    longitude,
    latitude,
    contactId,
    mediaUrls,
    purchaseOrderId,
  } = ctx.request.validated.body;

  const data = {
    addressLine1: address1,
    addressLine2: address2 || undefined,
    state,
    city,
    zip,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
    coordinates: [longitude, latitude],

    contactId,
    media: Array.isArray(mediaUrls) ? mediaUrls : [],
    purchaseOrderId,
  };

  const newJobSite = await JobSiteRepo.getInstance(ctx.state).createOne({
    data,
    linkTo: customerId,
  });

  if (newJobSite) {
    const jsDataToMq = {
      schemaName,
      id: newJobSite.id,
      ...newJobSite.address,
    };

    await Promise.all([
      billingService.upsertJobSite(ctx, jsDataToMq),
      routePlannerPublisher.upsertJobSite(ctx, {
        ...jsDataToMq,
        location: newJobSite.location,
        coordinates: newJobSite.coordinates,
      }),
    ]);

    const contacts = await ContactRepo.getInstance(ctx.state).getAllPaginated({
      condition: { id: newJobSite.contactId },
      withContractor: true,
      limit: 1,
      skip: 0,
    });

    newJobSite.contact = contacts?.[0];
  }

  ctx.status = httpStatus.CREATED;
  if (newJobSite) {
    const body = { jobSiteLocation: mapJobSite(newJobSite) };
    ctx.body = body;
  } else {
    ctx.body = { jobSiteLocation: null };
  }
};

export const updateJobSite = async ctx => {
  const { schemaName } = ctx.state.user;
  const {
    jobSiteId: id,

    address1,
    address2,
    state,
    city,
    zip,
    longitude,
    latitude,
    contactId,
    mediaUrls,
    purchaseOrderId,
  } = ctx.request.validated.body;

  const data = {
    addressLine1: address1,
    addressLine2: address2 || undefined,
    state,
    city,
    zip,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
    coordinates: [longitude, latitude],

    contactId,
    media: Array.isArray(mediaUrls) ? mediaUrls : [],
    purchaseOrderId,
  };

  const updatedJobSite = await JobSiteRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    data,
  });

  if (updatedJobSite) {
    const jsDataToMq = {
      schemaName,
      id: updatedJobSite.id,
      ...updatedJobSite.address,
    };

    await Promise.all([
      billingService.upsertJobSite(ctx, jsDataToMq),
      routePlannerPublisher.upsertJobSite(ctx, {
        ...jsDataToMq,
        location: updatedJobSite.location,
        coordinates: updatedJobSite.coordinates,
      }),
    ]);

    const contacts = await ContactRepo.getInstance(ctx.state).getAllPaginated({
      condition: { id: updatedJobSite.contactId },
      withContractor: true,
      limit: 1,
      skip: 0,
    });

    updatedJobSite.contact = contacts?.[0];
  }

  ctx.status = httpStatus.OK;
  if (updatedJobSite) {
    const body = { jobSiteLocation: mapJobSite(updatedJobSite) };
    ctx.body = body;
  } else {
    ctx.body = { jobSiteLocation: null };
  }
};

export const getJobSiteById = async ctx => {
  const { jobSiteId: id } = ctx.request.validated.query;

  const jobSite = await JobSiteRepo.getInstance(ctx.state).getByPopulated({
    condition: { id },
  });

  ctx.status = httpStatus.OK;
  ctx.body = { jobSite: jobSite ? mapJobSite(jobSite) : null };
};

export const getJobSites = async ctx => {
  const { customerId } = ctx.state.user;
  const { pageNumber = 0, pageItemMax = 100, activeOnly } = ctx.request.query;
  const limit = Number(pageItemMax);
  const condition = { customerId };
  activeOnly && (condition.active = true);

  const jobSites = await JobSiteRepo.getInstance(ctx.state).getLinkedWithCustomerPopulated({
    condition,
    skip: Number(pageNumber) * limit,
    limit,
  });

  ctx.status = httpStatus.OK;
  if (!jobSites?.length) {
    ctx.body = { jobSites: [], ...zeroResults(limit) };
  } else {
    const pageCount = Number(pageNumber);
    ctx.body = {
      jobSites: jobSites.map(mapJobSite),
      pageItemMax: limit,
      pageNumber: pageCount,
      pageItemCount: pageCount > 0 ? jobSites.length % pageCount : jobSites.length,
      totalItemCount: await JobSiteRepo.getInstance(ctx.state).countLinkedWithCustomerPopulated({
        condition,
      }),
    };
  }
};

const mapCan = item => ({
  canTypeId: item.id,
  active: item.active,
  title: item.shortDescription,
  description: item.description,
  closed: item.closedTop,
  yards: item.size,
  dimension: {
    length: item.length ?? 0,
    width: item.width ?? 0,
    height: item.height ?? 0,
  },
  imageUrl: item?.imageUrl,
});

export const getMaterials = async ctx => {
  const { activeOnly } = ctx.request.validated.query;
  const condition = {};
  if (activeOnly) {
    condition[`${MaterialRepo.TABLE_NAME}.active`] = true;
    condition[`${EquipmentItemRepo.TABLE_NAME}.active`] = true;
  }

  const bl = await BusinessLineRepo.getInstance(ctx.state).getBy({
    condition: { type: BUSINESS_LINE_TYPE.rollOff },
    fields: ['id'],
  });
  condition.businessLineId = bl.id;

  const materials = await MaterialRepo.getInstance(ctx.state).getAllPopulated({
    condition,
  });

  ctx.status = httpStatus.OK;
  ctx.body = {
    materials:
      materials?.map(({ id, description, manifested, equipmentItems, active }) => ({
        materialId: id,
        materialType: description,
        manifested,
        active,
        canDetails: equipmentItems?.map(mapCan) ?? [],
      })) || [],
  };
};

export const getBillableServices = async ctx => {
  const { activeOnly, canTypeId } = ctx.request.validated.query;
  const condition = { oneTime: true };
  activeOnly && (condition.active = true);
  canTypeId && (condition.equipmentItemId = canTypeId);

  if (!canTypeId) {
    const bl = await BusinessLineRepo.getInstance(ctx.state).getBy({
      condition: { type: BUSINESS_LINE_TYPE.rollOff },
      fields: ['id'],
    });
    condition.businessLineId = bl.id;
  }

  const services = await BillableServiceRepo.getInstance(ctx.state).getAll({
    condition,
  });

  ctx.status = httpStatus.OK;
  ctx.body = {
    services:
      services?.map(({ id, action, description, active }) => ({
        serviceId: id,
        serviceType: action,
        description,
        active,
      })) || [],
  };
};

export const getPriceInfo = async ctx => {
  const { customerId, userId } = ctx.state.user;
  const {
    jobSiteId,
    canTypeId: equipmentItemId,
    serviceTypeId: billableServiceId,
    materialTypeId,
    serviceDate,
  } = ctx.request.validated.query;

  const [customer, contractor, businessLine, customerJobSite, billableService] = await Promise.all([
    CustomerRepo.getInstance(ctx.state).getBy({
      condition: { id: customerId },
      fields: ['customerGroupId'],
    }),
    ContractorRepo.getInstance(ctx.state).getById({
      id: userId,
      fields: ['businessUnitId'],
    }),
    BusinessLineRepo.getInstance(ctx.state).getBy({
      condition: { type: BUSINESS_LINE_TYPE.rollOff },
      fields: ['id'],
    }),
    customerJobSitePairRepo.getInstance(ctx.state).getBy({
      condition: { customerId, jobSiteId },
      fields: ['id'],
    }),
    BillableServiceRepo.getInstance(ctx.state).getById({
      id: billableServiceId,
      fields: ['materialBasedPricing'],
    }),
  ]);

  if (!customer) {
    throw ApiError.notFound('Customer not found', `Customer doesn't exist with id ${customerId}`);
  }
  let materialId = materialTypeId || null;
  if (!billableService?.materialBasedPricing) {
    materialId = null;
  }

  const { customerGroupId } = customer;
  const { id: customerJobSiteId = null } = customerJobSite;
  const { businessUnitId } = contractor;
  const { id: businessLineId } = businessLine;

  const customRatesGroups = await CustomRatesGroupRepo.getInstance(ctx.state).getActiveRatesGroups({
    condition: {
      businessUnitId,
      businessLineId,
      customerId,
      customerJobSiteId,
      serviceDate,
      customerGroupId,
    },
    fields: ['id', 'customerGroupId', 'customerId', 'customerJobSiteId', 'description'],
  });

  let customRatesGroup;
  if (customRatesGroups?.length) {
    if (customerJobSiteId) {
      customRatesGroup = customRatesGroups.find(
        item => customerJobSiteId === item.customerJobSiteId,
      );
    }
    if (!customRatesGroup && customerId) {
      customRatesGroup = customRatesGroups.find(item => customerId === item.customerId);
    }
    if (!customRatesGroup && customerGroupId) {
      customRatesGroup = customRatesGroups.find(item => customerGroupId === item.customerGroupId);
    }
  }

  const fields = ['price'];
  let price = 0;
  let globalRatesService;
  if (billableServiceId) {
    globalRatesService = await GlobalRatesServiceRepo.getInstance(ctx.state).getBy({
      condition: {
        businessUnitId,
        businessLineId,
        billableServiceId,
        equipmentItemId,
        materialId,
      },
      fields,
    });

    if (!globalRatesService) {
      throw ApiError.notFound('Global rates for billable service item not found');
    }

    price = mathRound2(Number(globalRatesService.price));
  }

  if (customRatesGroup) {
    let customRatesService;
    if (billableServiceId) {
      customRatesService = await CustomGroupRatesServiceRepo.getInstance(ctx.state).getBy({
        condition: {
          businessUnitId,
          businessLineId,
          customRatesGroupId: customRatesGroup.id,
          billableServiceId,
          equipmentItemId,
          materialId,
        },
        fields,
      });

      if (customRatesService?.price) {
        price = mathRound2(Number(customRatesService.price));
      }
    }
  }

  ctx.status = httpStatus.OK;
  ctx.body = {
    priceInfo: {
      jobSiteId,
      serviceDate,
      materialTypeId: materialId,
      canTypeId: equipmentItemId,
      serviceTypeId: billableServiceId,
      priceEach: price,
    },
  };
};

const getOrderRequestPopulated = async (ctx, { id }) => {
  const or = await OrderRequestRepo.getInstance(ctx.state).getById({ id });
  if (!or) {
    throw ApiError.notFound(`No Order Request found for id ${id}`);
  }

  const jsRepo = JobSiteRepo.getInstance(ctx.state);
  const [jobSite, jobSite2, purchaseOrder] = await Promise.all([
    jsRepo.getByPopulated({ condition: { id: or.jobSiteId } }),
    or.jobSite2Id ? jsRepo.getById({ id: or.jobSite2Id }) : Promise.resolve(),
    or.purchaseOrderId
      ? PurchaseOrderRepo.getInstance(ctx.state).getById({ id: or.purchaseOrderId })
      : Promise.resolve(),
  ]);

  const scheduledDate = new Date(or.serviceDate).toDateString();
  const grandTotal = Number(or.grandTotal);
  const { media = [] } = or;

  return {
    orderRequestId: or.id,

    jobSite: mapJobSite(jobSite),
    jobSite2: jobSite2 ? mapJobSite(jobSite2) : undefined,

    // mode,
    requestDate: new Date(or.createdAt).toDateString(),
    totalPrice: grandTotal,
    status: or.status,
    // confirmationUrl: '',
    paymentDetails: {
      paymentType: or.paymentMethod === PAYMENT_METHOD.creditCard ? 'CARD' : 'ON ACCOUNT',
      amount: grandTotal,
      cardId: or.creditCardId ?? undefined,
    },
    media,
    canDetails: [
      {
        orderRequestItemId: 1, // TODO: get rid of (required for some reason)
        purchaseOrder: purchaseOrder?.poNumber ?? null,
        scheduledDate,
        canTypeId: or.equipmentItemId,
        materialTypeId: or.materialId,
        serviceTypeId: or.billableServiceId,
        isAlleyPlacement: or.alleyPlacement,
        someoneOnSite: or.someoneOnSite,
        placementInstructions: or.driverInstructions,
        priceEach: Number(or.billableServicePrice),
        quantity: Number(or.billableServiceQuantity),
        media,
      },
    ],
  };
};

export const createOrderRequest = async ctx => {
  const { customerId, userId } = ctx.state.user;
  const {
    jobSiteId,
    canDetails: [canDetails],
    createReceipt,
    totalPrice,
    paymentDetails,
  } = ctx.request.validated.body;

  const total = Number(canDetails.priceEach) * Number(canDetails.quantity);
  if (Number(totalPrice).toFixed(5) !== total.toFixed(5)) {
    throw ApiError.invalidRequest('Total Price does not match with priceEach * quantity');
  }
  let paymentMethod = PAYMENT_METHOD.onAccount;
  if (paymentDetails.paymentType.toUpperCase() === 'CARD') {
    paymentMethod = PAYMENT_METHOD.creditCard;
  }

  const data = {
    contractorId: userId,
    customerId,

    jobSiteId,
    jobSite2Id: canDetails.jobSite2Id || null,

    billableServiceId: canDetails.serviceTypeId,
    equipmentItemId: canDetails.canTypeId,
    materialId: canDetails.materialTypeId,

    serviceDate: canDetails.scheduledDate,

    billableServicePrice: Number(canDetails.priceEach),
    billableServiceQuantity: Number(canDetails.quantity),
    billableServiceTotal: total,

    initialGrandTotal: total,
    grandTotal: total,

    mediaUrls: Array.isArray(canDetails.mediaUrls) ? canDetails.mediaUrls : [],
    driverInstructions: canDetails.placementInstructions || null,
    purchaseOrder: canDetails.poNumber || null,
    alleyPlacement: !!canDetails.alleyPlacement,
    someoneOnSite: !!canDetails.someoneOnSite,

    sendReceipt: !!createReceipt,
    paymentMethod,
    creditCardId: paymentDetails.cardId || null,
  };

  const result = await OrderRequestRepo.getInstance(ctx.state).createOne({
    data,
    fields: ['id'],
  });

  const orderRequest = await getOrderRequestPopulated(ctx, { id: result.id });

  ctx.status = httpStatus.CREATED;
  ctx.body = { orderRequest };
};

function formatOrderRequest(jobSite, or) {
  const scheduledDate = new Date(or.serviceDate).toDateString();
  const grandTotal = Number(or.grandTotal);
  const { media = [] } = or;

  const { equipmentItem: canType, material: materialType, billableService: serviceType } = or;

  return {
    orderRequestId: or.id,
    jobSite: mapJobSite(jobSite),
    jobSite2: or.jobSite2 ? mapJobSite(or.jobSite2) : undefined,
    // mode,
    requestDate: new Date(or.createdAt).toDateString(),
    totalPrice: grandTotal,
    status: or.status,
    // confirmationUrl: '',
    paymentDetails: {
      paymentType: or.paymentMethod === PAYMENT_METHOD.creditCard ? 'CARD' : 'ON ACCOUNT',
      amount: grandTotal,
      cardId: or.creditCardId ?? undefined,
    },
    media,
    canDetails: [
      {
        orderRequestItemId: 1, // TODO: get rid of (required for some resaon)
        purchaseOrder: or.purchaseOrder?.poNumber ?? null,
        scheduledDate,

        // canTypeId: or.equipmentItemId,
        canType: canType ? mapCan(canType) : null,
        // materialTypeId: or.materialId,
        materialType: {
          materialId: materialType.id,
          materialType: materialType.description,
          manifested: materialType.manifested,
        },
        // serviceTypeId: or.billableServiceId,
        serviceType: {
          serviceId: serviceType.id,
          serviceType: serviceType.action,
          description: serviceType.description,
        },

        alleyPlacement: or.alleyPlacement,
        someoneOnSite: or.someoneOnSite,
        placementInstructions: or.driverInstructions,
        priceEach: Number(or.billableServicePrice),
        quantity: Number(or.billableServiceQuantity),
        media,
      },
    ],
  };
}

export const getOrderRequests = async ctx => {
  const { customerId } = ctx.state.user;
  const { jobSiteId } = ctx.request.validated.query;
  const { pageNumber = 0, pageItemMax = 100 } = ctx.request.validated.query;
  const limit = Number(pageItemMax);

  const jobSite = await JobSiteRepo.getInstance(ctx.state).getByPopulated({
    condition: { id: jobSiteId },
  });

  if (!jobSite) {
    throw ApiError.notFound(`No Job Site found for id ${jobSiteId}`);
  }

  const condition = { jobSiteId, customerId, status: ORDER_REQUEST_STATUS.requested };
  const items = await OrderRequestRepo.getInstance(ctx.state).getAllPaginatedRequests({
    condition,
    skip: Number(pageNumber) * limit,
    limit,
  });

  const orderRequests = items?.map(formatOrderRequest.bind(null, jobSite)) ?? [];

  ctx.status = httpStatus.OK;

  if (!orderRequests?.length) {
    ctx.body = { orderRequests: [], ...zeroResults(limit) };
  } else {
    const pageCount = Number(pageNumber);
    ctx.body = {
      orderRequests,
      pageItemMax: limit,
      pageNumber: pageCount,
      pageItemCount: pageCount > 0 ? orderRequests.length % pageCount : orderRequests.length,
      totalItemCount: await OrderRequestRepo.getInstance(ctx.state).count({
        condition,
      }),
    };
  }
};

const getOrderStatus = status => {
  if (status === ORDER_STATUS.inProgress) {
    return 'Active';
  }
  if (status === ORDER_STATUS.invoiced) {
    return 'Invoiced';
  }
  return 'Completed';
};

const getMimeType = url => {
  let mimeType;
  if (url.endsWith('.pdf')) {
    mimeType = 'application/pdf';
  } else if (url.endsWith('.png')) {
    mimeType = 'image/png';
  } else {
    mimeType = 'image/jpeg';
  }
  return mimeType;
};

function formatSalesOrder(_jobSite, order) {
  const grandTotal = Number(order.grandTotal);
  const { material: materialType, billableService: serviceType, equipmentItem: canType } = order;

  const jobSite = mapJobSite(_jobSite);
  jobSite.contactId = jobSite?.contact?.id;

  const { status, orderRequest, workOrder } = order;
  const orderRequestDate = orderRequest?.serviceDate
    ? new Date(orderRequest.serviceDate).toDateString()
    : null;
  const scheduledDate = order?.serviceDate ? new Date(order.serviceDate).toDateString() : null;
  const { media = [], status: orderRequestStatus = null } = orderRequest ?? {};

  const { ticketUrl, alleyPlacement, someoneOnSite, mediaFiles = [] } = workOrder ?? {};

  return {
    orderRequestId: orderRequest?.id || null,
    salesorderId: order.id,
    orderRequestDate,
    purchaseOrder: order.purchaseOrderId,
    scheduledDate,

    jobSite,
    jobSite2: order.jobSite2 ? mapJobSite(order.jobSite2) : undefined,

    // canTypeId: or.equipmentItemId,
    canType: canType ? Object.assign(mapCan(canType), { id: canType.originalId }) : null,
    // materialTypeId: or.materialId,
    materialType: {
      materialId: materialType.originalId,
      materialType: materialType.description,
      manifested: materialType.manifested,
    },
    // serviceTypeId: or.billableServiceId,
    serviceType: {
      serviceId: serviceType.originalId,
      serviceType: serviceType.action,
      description: serviceType.description,
    },

    alleyPlacement,
    someoneOnSite,
    placementInstructions: order.driverInstructions,

    priceEach: Number(order.billableServicePrice),
    quantity: 1,
    totalPrice: grandTotal,

    status: status ? getOrderStatus(status) : undefined,
    canceled: status === ORDER_STATUS.canceled,

    // TODO: is needed check for disposalSiteId presence?
    disposalDocUrl: ticketUrl ?? undefined,
    disposalDocMimeType: ticketUrl ? getMimeType(ticketUrl) : undefined,

    media: media?.concat(mediaFiles.map(({ url }) => url)) ?? [],
    orderRequestStatus,
  };
}

export const getSalesOrderById = async ctx => {
  const { id } = ctx.params;

  const order = await OrderRepo.getInstance(ctx.state).getBy({
    condition: { id },
    fields: [
      'id',
      'orderRequestId',
      'status',
      'workOrderId',
      'serviceDate',
      'billableServicePrice',
      'grandTotal',
      'billableServiceId',
      'equipmentItemId',
      'materialId',
      'driverInstructions',
      'customerJobSiteId',
      'jobSiteId',
      'jobSite2Id',
      'purchaseOrder',
    ],
  });

  if (!order) {
    throw ApiError.notFound(`No SalesOrder found with id ${id}`);
  }

  const jobSite = await JobSiteRepo.getInstance(ctx.state).getByPopulated({
    condition: { id: order.jobSite.originalId },
  });

  const salesOrder = formatSalesOrder(jobSite, order);

  let invoice = [];
  if (order.status === ORDER_STATUS.invoiced) {
    invoice = await billingService.getInvoicesByOrders(ctx, { orderIds: [id] });
  }

  if (invoice) {
    salesOrder.invoiceUrl = invoice?.pdfUrl || '';
    salesOrder.invoiceMimeType = invoice?.pdfUrl ? getMimeType(invoice.pdfUrl) : undefined;
  }

  ctx.status = httpStatus.OK;
  ctx.body = { salesOrder };
};

export const getSalesOrders = async ctx => {
  const { customerId } = ctx.state.user;
  const { jobSiteId, historical } = ctx.request.validated.query;
  const { pageNumber = 0, pageItemMax = 100 } = ctx.request.validated.query;
  const limit = Number(pageItemMax);

  const jobSite = await JobSiteRepo.getInstance(ctx.state).getByPopulated({
    condition: { id: jobSiteId },
  });

  if (!jobSite) {
    throw ApiError.notFound(`No Job Site found for id ${jobSiteId}`);
  }

  const repo = OrderRepo.getInstance(ctx.state);
  const orders = await repo.getAllRequestsOriginated({
    condition: { historical, jobSiteId, customerId },
    skip: Number(pageNumber) * limit,
    limit,
  });

  if (!orders?.length) {
    ctx.body = { salesOrders: [], ...zeroResults(limit) };
    return;
  }

  const salesOrders = orders?.map(formatSalesOrder.bind(null, jobSite)) ?? [];

  const mediaRepo = MediaFileRepo.getInstance(ctx.state);
  await Promise.all(
    salesOrders.map(async (salesOrder, i) => {
      const woMedia = await mediaRepo.getUrlsByWorkOrderId(orders[i].workOrder.id);
      if (woMedia?.length) {
        salesOrder.media = salesOrder.media?.concat(woMedia.map(({ url }) => url)) ?? [];
      }
    }),
  );

  if (historical) {
    const invoices = await billingService.getInvoicesByOrders(ctx, {
      orderIds: orders.map(({ id }) => id),
    });

    if (invoices?.length) {
      salesOrders.forEach((item, i) => {
        const invoice = invoices.find(({ orderId }) => String(orders[i].id) === String(orderId));

        item.invoiceUrl = invoice?.pdfUrl || '';
        item.invoiceMimeType = invoice?.pdfUrl ? getMimeType(invoice.pdfUrl) : undefined;
      });
    }
  }

  ctx.status = httpStatus.OK;

  const pageCount = Number(pageNumber);
  ctx.body = {
    salesOrders,
    pageItemMax: limit,
    pageNumber: pageCount,
    pageItemCount: pageCount > 0 ? salesOrders.length % pageCount : salesOrders.length,
    totalItemCount: await repo.countOrdersFromRequests({ historical, jobSiteId }),
  };
};

export const updateOrderRequest = async ctx => {
  const { customerId, userId } = ctx.state.user;
  const {
    orderRequestId,
    jobSiteId,
    canDetails: [canDetails],
    createReceipt,
    totalPrice,
    paymentDetails,
  } = ctx.request.validated.body;

  const total = Number(canDetails.priceEach) * Number(canDetails.quantity);
  if (Number(totalPrice).toFixed(5) !== total.toFixed(5)) {
    throw ApiError.invalidRequest('Total Price does not match with priceEach * quantity');
  }
  let paymentMethod = PAYMENT_METHOD.onAccount;
  if (paymentDetails.paymentType.toUpperCase() === 'CARD') {
    paymentMethod = PAYMENT_METHOD.creditCard;
  }

  const or = await OrderRequestRepo.getInstance(ctx.state).getById({
    id: orderRequestId,
  });
  if (!or) {
    throw ApiError.notFound(`No Order Request found for id ${orderRequestId}`);
  }
  if (or.status !== ORDER_REQUEST_STATUS.requested) {
    throw ApiError.invalidRequest(`Only Order with 'requested' status can be edited`);
  }

  const data = {
    contractorId: userId,
    customerId,

    jobSiteId,
    jobSite2Id: canDetails.jobSite2Id || null,

    billableServiceId: canDetails.serviceTypeId,
    equipmentItemId: canDetails.canTypeId,
    materialId: canDetails.materialTypeId,

    serviceDate: canDetails.scheduledDate,

    billableServicePrice: Number(canDetails.priceEach),
    billableServiceQuantity: Number(canDetails.quantity),
    billableServiceTotal: total,

    initialGrandTotal: total,
    grandTotal: total,

    mediaUrls: Array.isArray(canDetails.mediaUrls) ? canDetails.mediaUrls : [],
    driverInstructions: canDetails.placementInstructions || null,
    purchaseOrder: canDetails.poNumber || null,
    alleyPlacement: !!canDetails.alleyPlacement,
    someoneOnSite: !!canDetails.someoneOnSite,

    sendReceipt: !!createReceipt,
    paymentMethod,
    creditCardId: paymentDetails.cardId || null,
  };

  await OrderRequestRepo.getInstance(ctx.state).updateOne({
    condition: { id: orderRequestId },
    data,
    fields: [],
  });

  const orderRequest = await getOrderRequestPopulated(ctx, { id: orderRequestId });

  ctx.status = httpStatus.OK;
  ctx.body = { orderRequest };
};

export const removeOrderRequest = async ctx => {
  const { orderRequestId } = ctx.request.validated.body;

  const or = await OrderRequestRepo.getInstance(ctx.state).getById({
    id: orderRequestId,
  });
  if (!or) {
    throw ApiError.notFound(`No Order Request found for id ${orderRequestId}`);
  }
  if (or.status !== ORDER_REQUEST_STATUS.requested) {
    throw ApiError.invalidRequest(`Only Order with 'requested' status can be removed`);
  }

  await OrderRequestRepo.getInstance(ctx.state).deleteBy({
    condition: { id: orderRequestId },
    fields: [],
  });

  ctx.status = httpStatus.NO_CONTENT;
};

const mapNotification = notification => ({
  notificationId: notification.id,
  notificationType: notification.type,
  salesOrderId: notification.orderRequestId,
  time: notification.time,
  title: notification.title,
  body: notification.body,
  reportUrl: notification.reportUrl,
  read: true,
});

export const getNotifications = async ctx => {
  const { userId } = ctx.state.user;
  const { pageNumber = 0, pageItemMax = 100 } = ctx.request.query;
  const limit = Number(pageItemMax);
  const condition = { contractorId: userId };

  const notifications = await NotificationRepo.getInstance(ctx.state).getAllPaginated({
    condition,
    skip: Number(pageNumber) * limit,
    limit,
  });

  ctx.status = httpStatus.OK;
  if (!notifications?.length) {
    ctx.body = { notifications: [], ...zeroResults(limit) };
  } else {
    const pageCount = Number(pageNumber);
    ctx.body = {
      notifications: notifications.map(mapNotification),
      pageItemMax: limit,
      pageNumber: pageCount,
      pageItemCount: pageCount > 0 ? notifications.length % pageCount : notifications.length,
      totalItemCount: await NotificationRepo.getInstance(ctx.state).countBy({
        condition,
      }),
    };
  }
};

export const proxyDownloadFromBilling = async ctx => {
  const { customerId, userId } = ctx.state.user;
  const data = ctx.request.validated.body;
  const { fromDate, toDate } = data;

  const { pdfUrl } = await billingService.getMaterialsReportData(ctx, {
    customerId,
    ...data,
  });

  const repo = NotificationRepo.getInstance(ctx.state);
  await repo.createOne({
    data: {
      contractorId: userId,
      orderRequestId: null, // unrelated to single OR
      type: NOTIFICATION_TYPE.report,
      title: NOTIFICATION_TITLE.reportReady,
      time: new Date(),
      reportUrl: pdfUrl,
      body: repo.getReportReadyMsgBody({ fromDate, toDate }),
    },
    fields: [],
  });

  ctx.sendObj({ pdfUrl });
};

export const createMessage = async ctx => {
  const data = ctx.request.validated.body;
  const { user } = ctx.state;

  const chat = await ChatRepo.getInstance(ctx.state).getBy({
    condition: {
      contractorId: user.userId,
      status: CHAT_STATUS.pending,
    },
  });
  let connectedUsers = [];
  if (chat) {
    connectedUsers = getCsrIdsFromRoom(chat.id);
  }
  const result = await ChatMessagesRepo.getInstance(ctx.state).createMessage({
    data,
    user,
    connectedUsers,
    chatId: chat?.id,
    isContractor: true,
  });
  if (result) {
    emitToRoom(result.chatId, result);
  }
  ctx.status = httpStatus.CREATED;
  ctx.body = result;
};

export const getChatMessages = async ctx => {
  const { userId } = ctx.state.user;
  const { limit = ITEMS_PER_PAGE, offset = 0 } = ctx.request.validated.query;

  const result = await ChatMessagesRepo.getInstance(ctx.state).getAllPaginatedForContractor({
    condition: { contractorId: userId },
    fields: ['message', 'authorName', 'read', 'createdAt', 'contractorId', 'userId'],
    offset,
    limit,
  });

  ctx.sendArray(result);
};
