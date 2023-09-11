import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { groupBy } from 'lodash-es';

import {
  getHistoryActionType,
  HistoryActionType,
} from '@root/common/OrderHistory/helpers/historyActionType';

import { SubjectRow } from '../../BaseRows';
import { Badge } from '../../common-styles';
import { getSubjectMap } from '../helper';
import { WorkOrderHistoryChanges } from '../types';

const I18N_ROOT_PATH = 'Text.';

// Init action always have two prop (bestTimeToComeFrom and bestTimeToComeTo) with valid time
// With changes it can be 1 or 2 changes

export const BestTimeToCome: React.FC<WorkOrderHistoryChanges> = ({ actualChanges, attribute }) => {
  const { t } = useTranslation();

  if (actualChanges.length === 1) {
    const attrValue = actualChanges[0];
    // In case of actualChanges length equal 1 action will be always changed
    const action = getHistoryActionType(attrValue.previousValue, attrValue.newValue);
    const subject = getSubjectMap(t, attrValue.attribute);

    return (
      <SubjectRow subject={subject}>
        {t(`${I18N_ROOT_PATH}${action}`)}
        <Layouts.Margin left="1">
          <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
            {attrValue.previousValue}
          </Badge>
        </Layouts.Margin>
        <Layouts.Margin left="1">→</Layouts.Margin>
        <Layouts.Margin left="1">
          <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
            {attrValue.newValue}
          </Badge>
        </Layouts.Margin>
      </SubjectRow>
    );
  }

  const attributes = groupBy(actualChanges, change => change.attribute);

  const bestTimeToComeFrom = attributes.bestTimeToComeFrom[0];
  const bestTimeToComeTo = attributes.bestTimeToComeTo[0];

  const subject = getSubjectMap(t, attribute);

  // No matter what to check bestTimeToComeFrom or bestTimeToComeTo
  const action = getHistoryActionType(
    bestTimeToComeFrom.previousValue,
    bestTimeToComeFrom.newValue,
  );
  // In case of init action will be only added, another case always changed

  return (
    <SubjectRow subject={subject}>
      {t(`${I18N_ROOT_PATH}${action}`)}
      <Layouts.Margin left="1">
        {action === HistoryActionType.Changed && (
          <>
            <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
              {bestTimeToComeFrom.previousValue}
            </Badge>
            -
          </>
        )}
        <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
          {bestTimeToComeFrom.newValue}
        </Badge>
      </Layouts.Margin>
      <Layouts.Margin left="1">→</Layouts.Margin>
      <Layouts.Margin left="1">
        {action === HistoryActionType.Changed && (
          <>
            <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
              {bestTimeToComeTo.previousValue}
            </Badge>
            -
          </>
        )}
        <Badge color="default" shade="dark" bgColor="grey" bgShade="light">
          {bestTimeToComeTo.newValue}
        </Badge>
      </Layouts.Margin>
    </SubjectRow>
  );
};
