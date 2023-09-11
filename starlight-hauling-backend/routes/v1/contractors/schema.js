import Joi from 'joi';

const id = Joi.number().integer().positive();

export const activeOnly = Joi.object().keys({
  activeOnly: Joi.boolean().optional(),
});

export const contactParams = Joi.object().keys({
  contactId: id.optional(),
  pageItemMax: Joi.number().positive().optional(),
});

export const newCreditCard = Joi.object()
  .keys({
    number: Joi.string().required(),
    ownerName: Joi.string().required(),

    expireMonth: Joi.string().length(2).required(),
    expireYear: Joi.string().length(4).required(),

    billingAddress: Joi.string().required(),
    billingAddress2: Joi.string().allow(null, '').default(null).optional(),
    billingState: Joi.string().required(),
    billingCity: Joi.string().required(),
    billingZip: Joi.string().required(),

    cvv: Joi.string().min(3).max(4).required(),
    // saveCard: Joi.boolean().default(true),
    // brand: Joi.string().optional(),
  })
  .required();

export const updateCreditCard = Joi.object()
  .keys({
    cardId: id.required(),

    ownerName: Joi.string().required(),

    expireMonth: Joi.string().length(2).required(),
    expireYear: Joi.string().length(4).required(),

    billingAddress: Joi.string().required(),
    billingAddress2: Joi.string().allow(null, '').default(null).optional(),
    billingState: Joi.string().required(),
    billingCity: Joi.string().required(),
    billingZip: Joi.string().required(),

    // special "removal" case
    active: Joi.boolean().optional().default(true),
  })
  .required();

export const newJobSite = Joi.object()
  .keys({
    // active: Joi.boolean().default(true),
    address1: Joi.string().required(),
    address2: Joi.string().allow(null, '').default(null).optional(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    zip: Joi.string().required(),

    longitude: Joi.number().required(),
    latitude: Joi.number().required(),

    contactId: id.optional(),
    mediaUrls: Joi.array().items(Joi.string()).optional(),
    purchaseOrder: Joi.string().optional().allow(null),
  })
  .required();

export const editJobSite = Joi.object()
  .keys({
    jobSiteId: id.required(),

    address1: Joi.string().required(),
    address2: Joi.string().allow(null, '').default(null).optional(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    zip: Joi.string().required(),

    longitude: Joi.number().required(),
    latitude: Joi.number().required(),

    contactId: id.optional(),
    mediaUrls: Joi.array().items(Joi.string()).optional(),
    purchaseOrder: Joi.string().optional().allow(null),
  })
  .required();

export const jobSiteId = Joi.object()
  .keys({
    jobSiteId: id.required(),
  })
  .required();

export const canTypeId = Joi.object().keys({
  canTypeId: id.optional(),
});

export const paginated = Joi.object().keys({
  pageNumber: Joi.number().integer().optional(),
  pageItemMax: Joi.number().integer().positive().optional(),
});

export const profileData = Joi.object()
  .keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    mobile: Joi.string().allow(null, '').default(null),

    imageUrl: Joi.string().allow(null, '').default(null),
    tocAccepted: Joi.boolean().required(),
  })
  .required();

export const priceParams = Joi.object()
  .keys({
    jobSiteId: id.required(),
    canTypeId: id.required(),
    serviceTypeId: id.required(),
    materialTypeId: id.required(),
    serviceDate: Joi.date().required(),
    // priceGroupId: id.optional(),
  })
  .required();

export const createOrder = Joi.object()
  .keys({
    jobSiteId: id.required(),
    canDetails: Joi.array()
      .items(
        Joi.object()
          .keys({
            jobSite2Id: id.allow(null, '').optional(),
            materialTypeId: id.required(),
            canTypeId: id.required(),
            serviceTypeId: id.required(),
            scheduledDate: Joi.date().required(),
            placementInstructions: Joi.string().allow(null, '').optional(),
            poNumber: Joi.string().allow(null, '').optional(),
            alleyPlacement: Joi.boolean().optional(),
            someoneOnSite: Joi.boolean().optional(),
            mediaUrls: Joi.array().items(Joi.string()).optional(),
            quantity: Joi.number().required().default(1),
            priceEach: Joi.number().min(0).required(),
          })
          .required(),
      )
      .length(1)
      .required(),
    createReceipt: Joi.boolean().optional(),
    totalPrice: Joi.number().min(0).required(),
    paymentDetails: Joi.object()
      .keys({
        paymentType: Joi.string().required(),
        cardId: id.allow(null, '').optional(),
      })
      .required(),
  })
  .required();

export const orderRequestId = Joi.object()
  .keys({
    orderRequestId: id.required(),
  })
  .required();

export const historical = Joi.object().keys({
  historical: Joi.boolean().optional(),
});

export const downloadSchema = Joi.object().keys({
  jobSiteId: id.optional(),
  allActiveOnly: Joi.boolean().optional(),

  fromDate: Joi.date().max(Joi.ref('toDate')).required(),
  toDate: Joi.date().required(),
});

export const newMessageData = Joi.object()
  .keys({
    message: Joi.string().min(1).max(512).required(),
  })
  .required();

export const getChatMessagesParams = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
});
