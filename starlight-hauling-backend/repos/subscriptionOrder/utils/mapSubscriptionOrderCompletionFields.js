import fpOmit from 'lodash/fp/omit.js';

export const mapSubscriptionOrderCompletionFields = originalObj =>
  fpOmit(['completionFields', 'mediaFiles', 'noBillableService'])({
    ...originalObj,
    ...originalObj.completionFields,
  });
