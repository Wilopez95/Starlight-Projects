import httpStatus from 'http-status';

export const getQBServicesList = async ctx => {
  const { integrationId, billableItemType } = ctx.request.validated.query;
  const { QBService } = ctx.state.models;
  if (integrationId) {
    const query = QBService.query().where({ configurationId: integrationId });
    if (billableItemType) {
      if (Array.isArray(billableItemType)) {
        billableItemType.forEach((type, index) => {
          if (index) {
            query.orWhere({ type });
          } else {
            query.andWhere({ type });
          }
        });
      } else {
        query.andWhere({ type: billableItemType });
      }
    }
    const QBServices = await query;
    ctx.body = {
      items: QBServices,
    };
  } else {
    ctx.body = {};
  }
};

export const insertManyQBServices = async ctx => {
  const data = ctx.request.validated.body;
  const { billableItemType } = ctx.request.validated.query;
  const { id } = ctx.params;
  const { QBService } = ctx.state.models;
  const serviceList = [];
  data.forEach(account => {
    account.billableItems.forEach(service => {
      serviceList.push({
        configurationId: id,
        type: service.type,
        accountName: account.accountName,
        districtType: service.districtType,
        description: service.description,
        customerGroup: service.customerGroup,
        customerGroupId: service.customerGroupId,
        lineOfBussinessId: service.lineOfBussinessId,
        subscriptionBillingCycle: service.subscriptionBillingCycle,
        materialId: service.materialId,
        equipmentId: service.equipmentId,
        paymentMethodId: service.paymentMethodId,
        districtId: service.districtId,
      });
    });
  });
  const result = await QBService.insertMany({
    configurationId: id,
    data: serviceList,
    fields: [
      'configurationId',
      'type',
      'accountName',
      'districtType',
      'description',
      'customerGroup',
      'customerGroupId',
      'lineOfBussinessId',
      'subscriptionBillingCycle',
      'materialId',
      'equipmentId',
      'paymentMethodId',
      'districtId',
    ],
    billableItemType,
  });
  ctx.body = result;
  ctx.status = httpStatus.OK;
};
