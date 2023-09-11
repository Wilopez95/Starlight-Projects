import React, { FC, useEffect, useState } from 'react';
import { useField } from 'react-final-form';
import LineTextField from '@starlightpro/common/components/LineTextField';

import { usePrintNode } from '../../../hooks/usePrintNode';
import { SearchField } from '../../../components/FinalForm/SearchField';
import { ENABLE_TEST_SCALES, printNodeMockedScale } from '../../../constants';

export interface ScaleFieldProps {
  name: string;
  label?: JSX.Element | string;
}

export interface ScaleOption {
  label: string;
  value: string;
  scale: PrintNodeClient.ScaleResponse;
}

export const ScaleField: FC<ScaleFieldProps> = (props) => {
  const { api } = usePrintNode();
  const { input } = useField('computerId', { subscription: { value: true } });
  const [options, setOptions] = useState<Array<ScaleOption>>([]);

  useEffect(() => {
    let isCanceled = false;
    (async function () {
      if (!api || !(input.value || input.value === 0)) {
        return;
      }

      const scales = (await api.scales(
        {},
        { computerId: input.value },
      )) as PrintNodeClient.ScaleResponse[];

      if (ENABLE_TEST_SCALES) {
        scales.unshift(printNodeMockedScale);
      }

      if (isCanceled) {
        return;
      }

      setOptions(
        scales.map((scale) => {
          const device =
            scale.deviceNum === 0 ? scale.deviceName : `${scale.deviceName} ${scale.deviceNum}`;

          return {
            label: device,
            value: device,
            scale,
          };
        }),
      );
    })();

    return () => {
      isCanceled = true;
    };
  }, [api, input.value]);

  return (
    <SearchField
      name={props.name}
      label={props.label}
      options={options}
      InputComponent={LineTextField}
      mapValues={{
        mapFieldValueToFormValue(value) {
          return (value as ScaleOption)?.scale;
        },
        mapFormValueToFieldValue(value) {
          const scale = (value as any) as ScaleOption['scale'];

          return scale?.deviceNum === 0
            ? scale.deviceName
            : `${scale.deviceName} ${scale.deviceNum}`;
        },
      }}
    />
  );
};
