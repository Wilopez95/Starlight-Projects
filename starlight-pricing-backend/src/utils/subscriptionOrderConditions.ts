import { ITupleConditions } from '../Interfaces/SubscriptionOrders';

export const unambiguousTupleCondition = (
  tableName: string,
  tupleConditions?: ITupleConditions[],
) =>
  tupleConditions?.map(tupleCondition =>
    tupleCondition[0].includes('.')
      ? [tupleCondition[0], tupleCondition[1], tupleCondition[2]]
      : [`${tableName}.${tupleCondition[0]}  ${tupleCondition[1]} '${tupleCondition[2]}'`],
  );
