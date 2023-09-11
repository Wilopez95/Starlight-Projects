import React from 'react';
import { startCase } from 'lodash-es';

import { IOrderHistoryItem, IThreshold, Maybe } from '@root/types';

import { HistoryRow } from '../../components/HistoryRow/HistoryRow';
import { SubjectRow } from '../BaseRows';

import { resolveEditedChanges } from './resolver';

export const resolveOrderHistoryItemThresholdItemGroupEvent = (
  historyItem: IOrderHistoryItem,
): React.ReactNode => {
  const populatedLineItem: Maybe<IThreshold> = historyItem.populatedFields
    .thresholdId as Maybe<IThreshold>;

  if (!populatedLineItem) {
    return null;
  }

  const description = startCase(populatedLineItem.description);

  switch (historyItem.eventType) {
    case 'edited': {
      return historyItem.changes.map(x => {
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
            added
          </SubjectRow>
        </HistoryRow>
      );
    }
    case 'deleted': {
      return (
        <HistoryRow>
          <SubjectRow prefix="Threshold" subject={description}>
            deleted
          </SubjectRow>
        </HistoryRow>
      );
    }
    default:
      return null;
  }
};
