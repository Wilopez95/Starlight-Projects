import mergeAddressComponents from '../../../utils/mergeAddressComponents.js';

import { DISPATCH_ACTION, LOCATION_TYPE, WO_STATUS } from '../../../consts/workOrder.js';
import { WAYPOINT_TYPE_IN_DISPATCH } from '../../../consts/waypointType.js';

const getWorkOrderDataToCompleteOrder = ({ billableService, disposalSite, jobSite2, material }) => {
  const data = {};
  if (jobSite2 && billableService?.action?.toUpperCase() === DISPATCH_ACTION.relocate) {
    data.location2 = {
      type: LOCATION_TYPE.waypoint,
      location: {
        lon: jobSite2.coordinates[0],
        lat: jobSite2.coordinates[1],
      },
      name: mergeAddressComponents(jobSite2.address),
    };
  } else if (disposalSite) {
    data.haulingDisposalSiteId = disposalSite.originalId;
    const waypointName = mergeAddressComponents(disposalSite.address ?? disposalSite);
    data.location2 = {
      type: LOCATION_TYPE.waypoint,
      location: {
        lon: disposalSite.coordinates[0],
        lat: disposalSite.coordinates[1],
      },
      waypointName,
      waypointType: WAYPOINT_TYPE_IN_DISPATCH[disposalSite.waypointType],
      name: waypointName,
      description: disposalSite.description,
    };
  } else {
    data.haulingDisposalSiteId = null;
    // hacky way to nullify location2
    data.locationId2 = null;
  }

  if (material) {
    data.haulingMaterialId = material.originalId;
    data.material = material.description;
  }

  // billable service isn't editable on Complete form

  return Object.assign(data, { status: WO_STATUS.completed });
};

export default getWorkOrderDataToCompleteOrder;
