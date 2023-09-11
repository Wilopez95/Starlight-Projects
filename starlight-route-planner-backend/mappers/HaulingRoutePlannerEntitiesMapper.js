// @ts-check

import {
  STATUS_LOWERCASE_STYLE,
  STATUS_UPPERCASE_STYLE,
} from '../consts/commonHaulingRoutePlannerEntities.js';

export default class HaulingRoutePlannerEntitiesMapper {
  static mapLowercaseStatus(status) {
    switch (status) {
      case STATUS_LOWERCASE_STYLE.scheduled:
        return STATUS_UPPERCASE_STYLE.scheduled;
      case STATUS_LOWERCASE_STYLE.inProgress:
        return STATUS_UPPERCASE_STYLE.inProgress;
      case STATUS_LOWERCASE_STYLE.completed:
        return STATUS_UPPERCASE_STYLE.completed;
      case STATUS_LOWERCASE_STYLE.approved:
        return STATUS_UPPERCASE_STYLE.approved;
      case STATUS_LOWERCASE_STYLE.finalized:
        return STATUS_UPPERCASE_STYLE.finalized;
      case STATUS_LOWERCASE_STYLE.canceled:
        return STATUS_UPPERCASE_STYLE.canceled;
      case STATUS_LOWERCASE_STYLE.invoiced:
        return STATUS_UPPERCASE_STYLE.invoiced;
      default:
        return null;
    }
  }

  static mapJobSite(jobSite) {
    return {
      name: jobSite.name ?? jobSite.addressLine1,
      addressLine1: jobSite.addressLine1,
      addressLine2: jobSite.addressLine2,
      city: jobSite.city,
      coordinates: jobSite.coordinates,
      id: jobSite.id,
      location: jobSite.location,
      state: jobSite.state,
      zip: jobSite.zip,
    };
  }
}
