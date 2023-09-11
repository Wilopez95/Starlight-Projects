import React from 'react';
import { startCase } from 'lodash-es';

import { HistoryRow } from '../../components/HistoryRow/HistoryRow';
import { SubjectRow } from '../BaseRows';

import { resolveEditedChanges } from './resolver';
import { IOrderHistoryItem } from '../../types';
import { Maybe } from '../../../../../../graphql/api';
import { IThreshold } from './types';
import { Trans } from '@starlightpro/common/i18n';

export const resolveOrderHistoryItemThresholdItemGroupEvent = (
  historyItem: IOrderHistoryItem,
): React.ReactNode => {
  const populatedLineItem: Maybe<IThreshold> = historyItem.populatedFields['thresholdId'];

  if (!populatedLineItem) {
    return null;
  }

  const description = startCase(populatedLineItem.description);

  switch (historyItem.eventType) {
    case 'edited': {
      return historyItem.changes.map((x) => {
        const data = resolveEditedChanges(x, populatedLineItem.description);

        if (!data) {
          return null;
        }

        return <HistoryRow key={x.attribute}>{data}</HistoryRow>;
      });
    }

    case 'created': {
      return (
        <HistoryRow>
          <SubjectRow prefix="Threshold" subject={description}>
            <Trans>added</Trans>
          </SubjectRow>
        </HistoryRow>
      );
    }
    case 'deleted': {
      return (
        <HistoryRow>
          <SubjectRow prefix="Threshold" subject={description}>
            <Trans>deleted</Trans>
          </SubjectRow>
        </HistoryRow>
      );
    }
  }
};
