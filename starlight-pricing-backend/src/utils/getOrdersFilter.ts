import { Between, In, IsNull, LessThanOrEqual, Not } from 'typeorm';
import { subDays } from 'date-fns';
import { IRequesParamsGeneral } from '../Interfaces/GeneralData';
import { getOrderData } from '../request/haulingRequest';
import { Context } from '../Interfaces/Auth';
import { IBody, ISort, IWhere } from '../Interfaces/GeneralsFilter';
import { IgetOrdersFilterBody, IgetOrdersFilterQuery } from '../Interfaces/Orders';

const validateSort = (tmp: string): string => {
  if (tmp === 'lineOfBusiness') {
    return 'businessLineId';
  } else if (tmp === 'woNumber') {
    return 'workOrderId';
  } else if (tmp === 'jobSite') {
    return 'jobSiteId';
  } else if (tmp === 'service') {
    return 'serviceAreaId';
  } else if (tmp === 'customerName') {
    return 'customerId';
  } else if (tmp === 'total') {
    return 'grandTotal';
  }
  return tmp;
};

export const getOrdersFilter = async (ctx: Context, history: Boolean) => {
  const { email } = ctx.state.user;
  const {
    limit,
    skip,
    sortBy,
    sortOrder,
    finalizedOnly,
    businessUnitId,
    mine,
    status,
    filterByMaterials,
    filterByPaymentTerms,
    filterByPaymentMethod,
    filterByServiceDateTo,
    filterByServiceDateFrom,
    filterByWeightTicket,
    filterByBusinessLine,
    //filterByBroker,
    filterByCsr,
    filterByHauler,
    filterByService,
  } = ctx.request.query as IgetOrdersFilterQuery;

  const { workOrderId, id, disposalSite, customerId, originalCustomerId, serviceDate, orderIds } =
    ctx.request.body as IgetOrdersFilterBody;
  const body: IBody = {};
  const where: IWhere = {};
  let sort: ISort = {};
  if (skip) {
    body.skip = +skip;
  }
  if (limit) {
    body.take = +limit;
  }
  if (sortBy) {
    let tmp: string = sortBy.toString();
    if (history === true) {
      sort = { id: 'desc' };
    } else {
      tmp = validateSort(tmp);
      sort = { [tmp]: sortOrder ? sortOrder : 'ASC' };
    }
  }
  if (status) {
    if (status === 'finalized' && finalizedOnly === 'false') {
      where.status = In(['finalized', 'canceled']);
    } else {
      where.status = status;
    }
  }
  if (mine === 'true') {
    where.csrEmail = email;
  }

  if (businessUnitId) {
    where.businessUnitId = businessUnitId;
  }
  if (customerId) {
    where.customerId = customerId;
  }

  if (originalCustomerId) {
    where.originalCustomerId = originalCustomerId;
  }

  if (serviceDate) {
    where.serviceDate = LessThanOrEqual(serviceDate);
  }

  if (workOrderId) {
    where.workOrderId = workOrderId;
  }
  if (disposalSite) {
    where.disposalSiteId = Not(IsNull());
  }
  let getmoreInfo: Boolean = false;
  if (id) {
    getmoreInfo = true;
    if (history === true) {
      where.originalId = id;
    } else {
      where.id = id;
    }
  }
  if (orderIds) {
    where.id = In(orderIds);
  }
  //The following filters should be implemented using joins between table when migration from pricing to core is done.
  if (filterByMaterials) {
    const materialIndexes: number[] = filterByMaterials.split(',').map(item => +item);
    const MaterialHistoricalIndexes: number[] = [];
    await Promise.all(
      materialIndexes.map(async item => {
        const requestbody: IRequesParamsGeneral = {
          materialIds: item,
        };
        const requestResponse = await getOrderData(ctx, { data: requestbody });
        requestResponse.materialIdList?.map(element => {
          MaterialHistoricalIndexes.push(element.id);
          return element;
        });
        return item;
      }),
    );
    where.materialId = In(MaterialHistoricalIndexes);
  }

  if (filterByPaymentTerms) {
    const paymentIndex: string[] = filterByPaymentTerms.split(',');
    const paymentHistoricalIndexes: number[] = [];
    await Promise.all(
      paymentIndex.map(async item => {
        const requestbody: IRequesParamsGeneral = {
          paymentTermsIds: item,
        };
        const requestResponse = await getOrderData(ctx, { data: requestbody });
        requestResponse.paymentTermsIdList?.map(element => {
          paymentHistoricalIndexes.push(element.id);
          return element;
        });
        return item;
      }),
    );
    where.customerId = In(paymentHistoricalIndexes);
  }

  if (filterByPaymentMethod) {
    const paymentIndex: string[] = filterByPaymentMethod.split(',');
    where.paymentMethod = In(paymentIndex);
  }
  if (filterByServiceDateTo && filterByServiceDateFrom) {
    const subday = subDays(new Date(filterByServiceDateFrom), 1);

    where.serviceDate = Between(subday, filterByServiceDateTo);
  }

  if (filterByWeightTicket) {
    where.highPriority = filterByWeightTicket;
  }

  if (filterByBusinessLine) {
    const paymentIndex: string[] = filterByBusinessLine.split(',');
    where.businessLineId = In(paymentIndex);
  }

  if (filterByCsr) {
    const paymentIndex: string[] = filterByCsr.split(',');
    where.csrName = In(paymentIndex);
  }

  if (filterByService) {
    const paymentIndex: string[] = filterByService.split(',');
    where.billableServiceId = In(paymentIndex);
  }

  if (filterByHauler) {
    const haulerIndex: string[] = filterByHauler.split(',');
    where.thirdPartyHaulerId = In(haulerIndex);
  }

  return { body, sort, where, getmoreInfo };
};
