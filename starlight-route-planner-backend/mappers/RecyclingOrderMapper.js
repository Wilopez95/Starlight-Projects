/* eslint-disable default-case */
// @ts-check
import { v4 as uuidv4 } from 'uuid';

import { WEIGHT_UNIT, RECYCLING_WEIGHT_UNIT } from '../consts/weightUnits.js';
import { DEFAULT_PRIVATE_MEDIA_URL } from '../consts/weightTicketMedia.js';
import { getFilenameFromUrl } from '../utils/urlUtil.js';

export default class RecyclingOrderMapper {
  static mapRecyclingOrderToWeightTicket(order) {
    const weightTicket = {
      ticketNumber: String(order.id),
      dailyRouteId: this._getDailyRouteId(order.WONumber), // recycling sent dailyRouteId with DR prefix in WONumber field e.g DR123 (DR - prefix, 123 - dailyRouteId)
      recyclingBusinessUnitId: order.businessUnitId,
      loadValue: Math.abs(order.weightIn - order.weightOut),
      weightUnit: this._mapWeightUnit(order.weightInUnit),
      disposalSiteId: order.disposalSite.id,
      materialId: order.material.id,
      arrivalTime: order.arrivedAt,
      departureTime: order.departureAt,
      timeOnLandfill: new Date(
        new Date(order.departureAt).getTime() - new Date(order.arrivedAt).getTime(),
      ).toUTCString(),
      authorId: 'system',
      authorName: 'system',
    };

    return weightTicket;
  }

  static mapRecyclingOrderToWeightTicketMedia(order) {
    const media = {
      id: uuidv4(),
      fileName: getFilenameFromUrl(order.weightTicketUrl),
      url: DEFAULT_PRIVATE_MEDIA_URL,
      timestamp: order.weightTicketAttachedAt,
      author: order.weightTicketCreator.email,
    };

    return media;
  }

  static _getDailyRouteId(woNumber) {
    const DAILY_ROUTE_PREFIX = 'DR';
    const dailyRouteId = woNumber.replace(DAILY_ROUTE_PREFIX, '');

    return Number(dailyRouteId);
  }

  static _mapWeightUnit(weightUnit) {
    switch (weightUnit) {
      case RECYCLING_WEIGHT_UNIT.ton:
        return WEIGHT_UNIT.tons;
    }

    throw Error(`Weight unit ${weightUnit} is not supported`);
  }
}
