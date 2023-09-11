import { SUBSCRIPTION_ORDER_STATUS } from '../../../consts/orderStatuses.js';

export const mapSubOrderStatus = (summary, cancellation) => {
  const { scheduled, completed, canceled, inProgress } = SUBSCRIPTION_ORDER_STATUS;

  const atLeast = (total, status) => summary.statuses[status] >= total;

  const allStatusesIn = (...statuses) =>
    statuses.reduce((sum, status) => sum + summary.statuses[status], 0) === summary.total;

  if (cancellation) {
    return canceled;
  }

  if (allStatusesIn(canceled, completed)) {
    // disabled due to acceptance criteria
    // in https://starlightpro.atlassian.net/browse/HAULING-2198
    // and re-enabled due to acceptance criteria
    // in https://starlightpro.atlassian.net/browse/HAULING-5763:
    if (atLeast(1, completed)) {
      return completed;
    }
    return canceled;
  }

  if (allStatusesIn(scheduled)) {
    // according to https://starlightpro.atlassian.net/browse/HAULING-4574
    // and https://starlightpro.atlassian.net/browse/HAULING-2198
    return scheduled;
  }
  // If at least 1 WO is other than Scheduled - Sub order should be 'In Progress'
  return inProgress;
};
