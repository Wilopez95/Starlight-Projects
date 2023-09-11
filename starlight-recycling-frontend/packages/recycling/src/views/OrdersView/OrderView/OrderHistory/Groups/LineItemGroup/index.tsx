import React from 'react';

import { HistoryRow } from '../../components/HistoryRow/HistoryRow';
import { IOrderHistoryItem } from '../../types';
import { SubjectRow } from '../BaseRows';

import { resolveEditedChanges } from './resolver';

export const resolveOrderHistoryItemLineItemGroupEvent = (
  historyItem: IOrderHistoryItem,
): React.ReactNode => {
  const populatedLineItem: Record<string, any> = historyItem.populatedFields['billableLineItemId'];
  const prefix =
    populatedLineItem.type === 'miscellaneousItem' ? 'Miscellaneous Item' : 'Line Item';

  if (!populatedLineItem) {
    return null;
  }

  switch (historyItem.eventType) {
    case 'edited': {
      return historyItem.changes.map((x) => {
        const data = resolveEditedChanges({ ...x, prefix }, populatedLineItem.description);

        if (!data) {
          return null;
        }

        return <HistoryRow key={x.attribute}>{data}</HistoryRow>;
      });
    }

    case 'created': {
      return (
        <HistoryRow>
          <SubjectRow prefix={prefix} subject={populatedLineItem.description}>
            added
          </SubjectRow>
        </HistoryRow>
      );
    }
    case 'deleted': {
      return (
        <HistoryRow>
          <SubjectRow prefix={prefix} subject={populatedLineItem.description}>
            deleted
          </SubjectRow>
        </HistoryRow>
      );
    }
  }
};
