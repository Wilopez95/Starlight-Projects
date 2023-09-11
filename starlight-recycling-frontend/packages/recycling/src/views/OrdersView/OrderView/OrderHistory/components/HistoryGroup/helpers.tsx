import React from 'react';

import { resolveOrderHistoryItemEntity } from '../../Groups';
import { resolveOrderHistoryItemMediaFileGroupEvents } from '../../Groups/MediaFileGroup';

import { IGroupedHistoryItems, IOrderHistoryItem } from '../../types';

export const formatHistoryItems = (items: IOrderHistoryItem[]) => {
  //Media files must be grouped in one 'Change'
  const { mediaFiles, otherItems } = items.reduce<IGroupedHistoryItems>(
    (cur, acc) => {
      if (acc.entityType === 'MEDIA_FILE') {
        cur.mediaFiles.push(acc);
      } else {
        cur.otherItems.push(acc);
      }

      return cur;
    },
    {
      mediaFiles: [],
      otherItems: [],
    },
  );

  const mediaData = resolveOrderHistoryItemMediaFileGroupEvents(mediaFiles);

  const data = otherItems.map((historyItem) => {
    const eventResolver = resolveOrderHistoryItemEntity(historyItem.entityType);

    return eventResolver(historyItem);
  });

  const filteredData = data.flat().filter(Boolean);

  if (!mediaData && filteredData.length === 0) {
    return null;
  }

  return (
    <>
      {filteredData.map((item, index) => (
        <React.Fragment key={index}>{item}</React.Fragment>
      ))}
      {mediaData}
    </>
  );
};
