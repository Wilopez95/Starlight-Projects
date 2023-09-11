import { format } from 'date-fns';
import { clear } from '../../helpers/data';
import { body } from '../../helpers/request';

const startTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

export const before = async api => {
  await api.createTimecard().send({ startTime });
};

export const after = clear;

export default {
  [`delete time card`]: async (request, api) => {
    const [timecard] = await body(api.listTimecards());

    await request({ timeCardId: timecard.id }).expect(204);
  },
};
