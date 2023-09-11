export const DISPATCH_FILTER_CHANGE = '@dispatcher/DISPATCH_FILTER_CHANGE';
export const UNPUBLISHED_CHANGE = '@dispatcher/DISPATCH_UNPUBLISHED_CHANGE';
export const CLEAR_UNPUBLISHED_CHANGES = '@dispatcher/DISPATCH_CLEAR_UNPUBLISHED_CHANGES';
export const RESET_DISPATCHER_FILTER = 'RESET_DISPATCHER_FILTER';

export function dispatchFilterChange(data) {
  return { type: DISPATCH_FILTER_CHANGE, data };
}

export function addUnpublishedChange(data) {
  return { type: UNPUBLISHED_CHANGE, data };
}

export function clearUnpublishedChanges() {
  return { type: CLEAR_UNPUBLISHED_CHANGES };
}

export function resetDispatcherFilter() {
  return { type: RESET_DISPATCHER_FILTER };
}
