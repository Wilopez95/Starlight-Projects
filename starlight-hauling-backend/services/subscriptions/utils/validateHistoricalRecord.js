import ApiError from '../../../errors/ApiError.js';

export const validateHistoricalRecord = (historicalRecord, tableName, value) => {
  if (!historicalRecord?.id) {
    throw ApiError.notFound(
      `No such historical entity`,
      `No historical entity for table ${tableName} with ID ${value} was found`,
    );
  }
};
