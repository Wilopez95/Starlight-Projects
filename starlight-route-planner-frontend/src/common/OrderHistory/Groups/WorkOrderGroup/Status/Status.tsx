import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { groupBy } from 'lodash-es';

import { StatusBadge } from '@root/common';
import {
  getHistoryActionType,
  HistoryActionType,
} from '@root/common/OrderHistory/helpers/historyActionType';
import { WorkOrderStatus } from '@root/consts';

import { SubjectRow } from '../../BaseRows';
import { WorkOrderHistoryChanges } from '../types';

const I18N_ROOT_PATH = 'Text.';

export const Status: React.FC<WorkOrderHistoryChanges> = ({ actualChanges }) => {
  const { t } = useTranslation();
  const attributes = groupBy(actualChanges, change => change.attribute);

  const { newValue, previousValue } = attributes.status[0];
  const statusLonChange = attributes.statusLonChange[0];
  const statusLatChange = attributes.statusLatChange[0];
  const action = getHistoryActionType(previousValue, newValue);

  return (
    <SubjectRow subject="Status">
      {t(`${I18N_ROOT_PATH}${action}`)}
      {action === HistoryActionType.Added && (
        <Layouts.Margin left="1">
          <StatusBadge status={newValue as WorkOrderStatus} routeType="work-orders" />
        </Layouts.Margin>
      )}
      {action === HistoryActionType.Changed && (
        <>
          <Layouts.Margin left="1">
            <StatusBadge status={previousValue as WorkOrderStatus} routeType="work-orders" />
          </Layouts.Margin>
          <Layouts.Margin left="1">→</Layouts.Margin>
          <Layouts.Margin left="1">
            <StatusBadge status={newValue as WorkOrderStatus} routeType="work-orders" />
          </Layouts.Margin>
        </>
      )}
      {/* TODO: set translations */}
      {<>changed in lang.{statusLonChange.newValue}</>}
      {<>; lat.{statusLatChange.newValue}</>}
    </SubjectRow>
  );
};
