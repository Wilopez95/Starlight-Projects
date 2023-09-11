import BaseRepository from '../../repos/_base.js';
import VersionedRepository from '../../repos/_versioned.js';

import fieldToLinkedTableMap from '../../consts/fieldToLinkedTableMap.js';
import { validateHistoricalRecord } from './utils/validateHistoricalRecord.js';

export const getLinkedHistoricalIds = async (
  trx,
  schemaName,
  { linkedData, existingItem } = {},
) => {
  const result = {};

  await Promise.all(
    Object.entries(linkedData).map(async ([key, value]) => {
      if (!value) {
        // edit when nullifying id
        if (value === null) {
          result[key] = null;
        }
        return;
      }

      const tableName = fieldToLinkedTableMap[key];

      const historicalRecord = await BaseRepository.getNewestHistoricalRecord(
        {
          tableName,
          schemaName,
          condition: { originalId: value },
        },
        trx,
      );

      validateHistoricalRecord(historicalRecord, tableName, value);

      if (existingItem) {
        const existingHistoricalRecord = await VersionedRepository.getEntityHistoricalRecordById(
          { schemaName, tableName, id: existingItem[key], fields: ['originalId'] },
          trx,
        );

        // update linked entity through id only if originalId is changed
        if (existingHistoricalRecord && existingHistoricalRecord.originalId === value) {
          result[key] = existingItem[key];
        } else {
          result[key] = historicalRecord.id;
        }
      } else {
        result[key] = historicalRecord.id;
      }
    }),
  );

  return result;
};
