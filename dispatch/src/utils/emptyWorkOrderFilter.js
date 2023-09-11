import moment from 'moment';

export const emptyWorkOrderFilter = {
  date: {
    startDate: moment().startOf('day').valueOf(),
    endDate: moment().endOf('day').valueOf(),
  },
  bounds: null,
  search: null,
  modifiedSince: null,
  driverId: null,
  size: null,
  material: null,
  action: null,
  status: null,
  scheduledStart: null,
  scheduledStartPM: null,
  scheduledStartAM: null,
  cow: null,
  sos: null,
  alleyPlacement: null,
  permittedCan: null,
  earlyPickUp: null,
  cabOver: null,
  okToRoll: null,
  priority: null,
  negotiatedFill: null,
  customerProvidedProfile: null,
};
