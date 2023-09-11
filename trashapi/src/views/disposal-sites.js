import { CORE_WAYPOINT_TYPE_TO_DISPATCH } from '../consts/waypoints.js';
import constants from '../utils/constants.js';
import { fromHaulingToDispatchCoordinates } from './location.js';

const {
  location: {
    type: { WAYPOINT },
  },
} = constants;

export const disposalSiteView = site => {
  if (!site) {
    return site;
  }

  const { location, description, waypointType, id } = site;
  const coordinates = fromHaulingToDispatchCoordinates(location);
  const dispatchLocation = {
    id: null,
    haulingDisposalSiteId: id,
    name: description,
    seedName: description,
    description,
    type: WAYPOINT,
    waypointName: description,
    waypointType: CORE_WAYPOINT_TYPE_TO_DISPATCH[waypointType],
    location: coordinates,
    latitude: coordinates.lat,
    longitude: coordinates.lon,
    licensePlate: null,
    deleted: false,
    createdBy: null,
    createdDate: null,
    modifiedBy: null,
    modifiedDate: null,
  };

  return dispatchLocation;
};

export const disposalSitesListView = sites => sites?.map(site => disposalSiteView(site));

export default disposalSiteView;
