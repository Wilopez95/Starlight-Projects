import FrequencyRepo from '../../repos/frequency.js';

export const getFrequencyAndServiceDaysForServiceItem = async (ctxState, serviceItem, trx) => {
  const frequencyRepo = FrequencyRepo.getInstance(ctxState);
  const { serviceFrequencyId, serviceDaysOfWeek } = serviceItem;

  let frequency = null;

  if (serviceFrequencyId) {
    frequency = await frequencyRepo.getById(
      {
        id: serviceFrequencyId,
        fields: ['id', 'times', 'type'],
      },
      trx,
    );
  }

  ctxState.logger.debug(
    serviceDaysOfWeek,
    'serviceItemsService->getFrequencyAndServiceDaysForServiceItem->serviceDaysOfWeek',
  );

  return { frequency, serviceDaysOfWeek };
};
