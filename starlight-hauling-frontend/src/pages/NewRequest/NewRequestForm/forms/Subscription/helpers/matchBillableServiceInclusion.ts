import { TFunction } from 'i18next';
import { compact, uniq } from 'lodash-es';

import { BillableItemActionEnum } from '@root/consts';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.helpers.matchBillableServiceInclusion.Text.';

export const matchBillableServiceInclusion = (
  billableItemActions: (BillableItemActionEnum | undefined)[],
  t: TFunction,
) => {
  const includedActions = uniq(compact(billableItemActions));

  if (includedActions.length === 0) {
    return t(`${I18N_PATH}NoInclusion`);
  }

  const includesExactActions = (actions: BillableItemActionEnum[]) =>
    actions.length === includedActions.length &&
    actions.every(action => includedActions.includes(action));

  if (includesExactActions([BillableItemActionEnum.delivery])) {
    return t(`${I18N_PATH}IncludesDelivery`);
  }

  if (includesExactActions([BillableItemActionEnum.delivery, BillableItemActionEnum.final])) {
    return t(`${I18N_PATH}IncludesDeliveryAndFinal`);
  }

  if (
    includesExactActions([
      BillableItemActionEnum.delivery,
      BillableItemActionEnum.service,
      BillableItemActionEnum.final,
    ])
  ) {
    return t(`${I18N_PATH}IncludesDeliveryAndServiceAndFinal`);
  }

  if (includesExactActions([BillableItemActionEnum.delivery, BillableItemActionEnum.service])) {
    return t(`${I18N_PATH}IncludesDeliveryAndService`);
  }

  if (includesExactActions([BillableItemActionEnum.service])) {
    return t(`${I18N_PATH}IncludesService`);
  }

  if (includesExactActions([BillableItemActionEnum.service, BillableItemActionEnum.final])) {
    return t(`${I18N_PATH}IncludesServiceAndFinal`);
  }

  if (includesExactActions([BillableItemActionEnum.final])) {
    return t(`${I18N_PATH}IncludesFinal`);
  }
};
