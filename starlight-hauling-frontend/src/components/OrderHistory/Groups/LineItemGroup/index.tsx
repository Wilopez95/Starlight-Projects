import React from 'react';

import { ILineItem, IOrderHistoryItem, Maybe } from '@root/types';

import { HistoryRow } from '../../components/HistoryRow/HistoryRow';
import { SubjectRow } from '../BaseRows';

import { resolveEditedChanges } from './resolver';

export const resolveOrderHistoryItemLineItemGroupEvent = (
  historyItem: IOrderHistoryItem,
): React.ReactNode => {
  const populatedLineItem: Maybe<ILineItem> = historyItem.populatedFields
    .billableLineItemId as Maybe<ILineItem>;

  if (!populatedLineItem) {
    return null;
  }

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
          <SubjectRow prefix="Line Item" subject={populatedLineItem.description}>
            added
          </SubjectRow>
        </HistoryRow>
      );
    }
    case 'deleted': {
      return (
        <HistoryRow>
          <SubjectRow prefix="Line Item" subject={populatedLineItem.description}>
            deleted
          </SubjectRow>
        </HistoryRow>
      );
    }
    default:
      return null;
  }
};
