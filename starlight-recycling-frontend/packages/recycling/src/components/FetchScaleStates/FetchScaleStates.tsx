import { FC, useEffect } from 'react';
import { isEqual, isNil, uniqBy } from 'lodash-es';
import { GetScalesQuery, Scale } from '../../graphql/api';
import { usePrintNode } from '../../hooks/usePrintNode';
import { printNodeMockedScale } from '../../constants';

export interface FetchScaleStatesProps {
  scales: GetScalesQuery['scales']['data'];
  onChange(newScaleStates: Record<number, boolean>): void;
}

export const FetchScaleStates: FC<FetchScaleStatesProps> = ({ onChange, scales }) => {
  const { api } = usePrintNode();

  useEffect(() => {
    if (!api || !scales) {
      return;
    }

    let prevScaleStates = {};
    let interval = setInterval(() => fetchPrintNodeScales(scales), 15000);
    fetchPrintNodeScales(scales);

    async function fetchPrintNodeScales(scales: GetScalesQuery['scales']['data']) {
      if (!api || !scales) {
        return;
      }

      const getScaleKey = (scale: Pick<Scale, 'computerId' | 'deviceName' | 'deviceNumber'>) =>
        `${scale.computerId}:${scale.deviceName}:${scale.deviceNumber}`;
      const uniqueScales = uniqBy(scales, getScaleKey);

      const filteredUniqScales = uniqueScales.filter((scale) => {
        const { deviceName } = scale;

        return deviceName !== printNodeMockedScale.deviceName;
      });

      const scalesMap = filteredUniqScales.reduce<Record<string, boolean>>((acc, scale) => {
        acc[getScaleKey(scale)] = false;

        return acc;
      }, {});

      await Promise.all(
        filteredUniqScales.map(async (scale) => {
          const { computerId, deviceNumber, deviceName } = scale;

          if (!computerId || isNil(deviceNumber) || !deviceName) {
            scalesMap[getScaleKey(scale)] = false;

            return;
          }

          try {
            await api.scales(
              {},
              {
                computerId,
                deviceNum: deviceNumber,
                deviceName,
              },
            );
          } catch {
            scalesMap[getScaleKey(scale)] = false;

            return;
          }

          scalesMap[getScaleKey(scale)] = true;
        }),
      );

      const newScaleStates = scales.reduce<Record<number, boolean>>((acc, scale) => {
        if (typeof acc[scale.id] === 'boolean') {
          return acc;
        }
        acc[scale.id] = scalesMap[getScaleKey(scale)] ?? false;

        return acc;
      }, {});

      if (!interval || isEqual(prevScaleStates, newScaleStates)) {
        return;
      }

      prevScaleStates = { ...newScaleStates };
      onChange(newScaleStates);
    }

    return () => {
      clearInterval(interval);
    };
  }, [api, onChange, scales]);

  return null;
};

export default FetchScaleStates;
