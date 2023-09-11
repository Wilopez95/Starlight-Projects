import assert from 'assert';
import R from 'ramda';
import { expect, body } from '../../helpers/request';
import { clear, isOdd, all } from '../../helpers/data';
import constants from '../../../src/utils/constants';
import { foldP } from '../../../src/utils/functions';
import config from '../../../src/config';

const secretPass = config.get('session.secret');

const {
  can: { size },
  workOrder: {
    action,
    material,
    status: { UNASSIGNED, ASSIGNED },
  },
} = constants;

const wos = R.times(R.identity, all);

export const before = async api => {
  const driver1 = await body(api.createDriver().send({ name: 'Driver 1' }));
  const driver2 = await body(api.createDriver().send({ name: 'Driver 2' }));

  await foldP(
    async (_, instructions) => {
      // create an unassigned order
      const workOrder = await body(
        api.createWorkorder().send({
          secretPass,
          status: UNASSIGNED,
          material: material[0],
          size: size[0],
          action: action.SPOT,
          instructions,
        }),
      );

      // assign Driver 1
      await api.updateWorkorder({ workOrderId: workOrder.id }).send({
        status: ASSIGNED,
        driverId: driver1.id,
      });

      if (isOdd(instructions)) {
        // assign Driver 2
        await api.updateWorkorder({ workOrderId: workOrder.id }).send({
          status: ASSIGNED,
          driverId: driver2.id,
        });
      }
    },
    null,
    wos,
  );
};

export const after = clear;

const mapInstructions = R.map(R.prop('instructions'));

export default {
  [`should fetch all the work orders which were assigned to the driver,
    no matter are they assigned to this driver right now `]: async (
    request,
    api,
  ) => {
    const [driver1, driver2] = await body(api.listDrivers());

    const wos1 = await body(expect(200, request({ driverId: driver1.id })));
    assert.deepEqual(
      mapInstructions(wos1),
      wos,
      'there should be all the orders associated with Driver 1',
    );

    const wos2 = await body(expect(200, request({ driverId: driver2.id })));
    assert.deepEqual(
      mapInstructions(wos2),
      R.filter(isOdd, wos),
      'only odd orders should be associated with Driver 2',
    );
  },
};
