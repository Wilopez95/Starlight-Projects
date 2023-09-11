import { random, set } from 'lodash-es';
import { ScaleResponseWithStatus } from './types';
import configureMeasurements, { allMeasures } from 'convert-units';

export const convert = configureMeasurements(allMeasures);

export function init(scale: ScaleResponseWithStatus): NodeJS.Timeout {
  const getRandomMass = () => random(convert(30).from('mt').to('mcg'), true);
  const updateScale = (mass: number) => {
    set(scale, 'mass[0]', mass);
    set(scale, 'clientReportedCreateTimestamp', new Date().toISOString());
  };

  const startSimulation = (mass: number) => {
    let isUp = true;
    let counter = 0;
    const steps = [
      0.05,
      0.008,
      0.0005,
      0.000008527586,
      0.000000027586,
      0.000000000586,
      0.000000000006,
      0.000000000001,
    ];
    const times = [1500, 1420, 1300, 1150, 1000, 870, 700, 600];
    let tempMass = mass;
    const simulation = () => {
      if (counter === steps.length) {
        updateScale(mass);

        return;
      }

      if (isUp) {
        tempMass +=
          convert(steps[counter]).from('mt').to('mcg') +
          convert(random(steps[counter] / 10))
            .from('mt')
            .to('mcg');
        isUp = false;
      } else {
        tempMass -=
          convert(steps[counter]).from('mt').to('mcg') +
          convert(random(steps[counter] / 10))
            .from('mt')
            .to('mcg');
        isUp = true;
      }

      updateScale(tempMass);

      setTimeout(simulation, times[counter]);

      counter++;
    };

    simulation();
  };

  startSimulation(getRandomMass());

  return setInterval(() => {
    startSimulation(getRandomMass());
  }, 20000);
}
