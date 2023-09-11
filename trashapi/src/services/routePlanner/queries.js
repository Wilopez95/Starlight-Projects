import {
  dailyRouteFragment,
  workOrderFragment,
  workOrderSimplifiedFragment,
  workOrderNotes,
  weightTicketFragment,
  landfillFragment,
} from './fragments.js';

export const DRIVER_DAILY_ROUTES = `
  query TrashapiDailyRoutes($serviceDate: String!, $driverId: Int!) {
    trashapiDailyRoutes(serviceDate: $serviceDate, driverId: $driverId) {
      ${dailyRouteFragment}
      workOrders {
        ${workOrderFragment}
      }
    }
  }
`;

export const UPDATE_DAILY_ROUTE = `
  mutation TrashapiUpdateDailyRoute($id: Int!, $body: UpdateDailyRouteTrashapi!) {
    trashapiUpdateDailyRoute(id: $id, input: $body) {
      ${dailyRouteFragment}
    }
  }
`;

export const UPDATE_WORK_ORDER = `
  mutation TrashapiUpdateWorkOrder($id: Int!, $body: UpdateWorkOrderTrashapi!) {
    trashapiUpdateWorkOrder(id: $id, input: $body) {
      ${workOrderSimplifiedFragment}
    }
  }
`;

export const WORK_ORDER_NOTES = `
  query TrashapiWorkOrderNotes($id: Int!) {
    trashapiNotes(id: $id) {
      ${workOrderNotes}
    }
  }
`;

export const WEIGHT_TICKETS = `
  query TrashapiWeightTickets($dailyRouteId: Int!) {
    weightTickets(dailyRouteId: $dailyRouteId) {
      ${weightTicketFragment}
    }
  }
`;

export const CREATE_WEIGHT_TICKET = `
  mutation TrashapiCreateWeightTicket($body: CreateWeightTicketInput!, $url: String!) {
    trashapiCreateWeightTicket(input: $body, url: $url) {
      ${weightTicketFragment}
    }
  }
`;

export const UPDATE_WEIGHT_TICKET = `
  mutation TrashapiUpdateWeightTicket($id: Int!, $body: UpdateWeightTicketInput!, $url: String) {
    trashapiUpdateWeightTicket(id: $id, input: $body, url: $url) {
      ${weightTicketFragment}
    }
  }
`;

export const WORK_ORDER_NOTES_COUNT = `
  query TrashapiWorkOrderNotesCount($id: Int!) {
    trashapiNotesCount(id: $id) {
      count
    }
  }
`;

export const LANDFILLS = `
  query ListHaulingDisposalSites($onlyLandfills: Boolean) {
    haulingDisposalSites(onlyLandfills: $onlyLandfills) {
      ${landfillFragment}
    }
  }
`;
