import { WeightTicketFragment } from './weightTicket';

export const DashboardFragment = `
  id
  name
  businessLineType
  status
  numberOfStops
  completedAt
  numberOfWos
  driverName
  truckId
  truckType
  completionRate
  businessUnitId
  color
  isEdited
  driverId
  businessUnitId
  editingBy
  clockIn
  clockOut
  odometerStart
  odometerEnd
  unitOfMeasure
  parentRouteId
  serviceDate
  violation
  uniqueAssignmentViolation
  weightTickets {
    ${WeightTicketFragment}
  }
`;
