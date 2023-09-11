import React from 'react';
import { HistoryRow } from '../../../components/HistoryRow/HistoryRow';
import { IOrderHistoryItem } from '../../../types';
import { SubjectRow } from '../../BaseRows';

import { resolveEditedChanges } from './resolver';

export const resolveOrderHistoryBillableLineItemsGroup = (
  historyItem: IOrderHistoryItem,
): React.ReactNode => {
  switch (historyItem.eventType) {
    case 'edited': {
      return historyItem.changes.map((change, i) => {
        const data = resolveEditedChanges(change);

        if (!data) {
          return null;
        }

        return <HistoryRow key={i}>{data}</HistoryRow>;
      });
    }

    case 'created': {
      return (
        <HistoryRow>
          <SubjectRow subject="Billable Item">added</SubjectRow>
        </HistoryRow>
      );
    }
    case 'deleted': {
      return (
        <HistoryRow>
          <SubjectRow subject="Billable Item">deleted</SubjectRow>
        </HistoryRow>
      );
    }
  }
};
