import { MasterRouteFragment } from './masterRoute';

export const DailyRouteNameFragment = `
  id
  name
`;

export const DailyRouteFragment = `
  ${DailyRouteNameFragment}
  status
  serviceDate
  businessUnitId
  color
  isEdited
  businessLineType
  parentRouteId
  editingBy
  parentRoute {
    ${MasterRouteFragment}
  }
  businessLineType
  completionRate
  driverName
  completedAt
  clockIn
  clockOut
  odometerStart
  odometerEnd
  truckId
  driverId
  violation
  uniqueAssignmentViolation
  createdAt
  updatedAt
`;
