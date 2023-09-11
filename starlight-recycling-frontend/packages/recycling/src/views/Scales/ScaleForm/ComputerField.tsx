import React, { FC, useEffect, useState } from 'react';
import LineTextField from '@starlightpro/common/components/LineTextField';
import { usePrintNode } from '../../../hooks/usePrintNode';
import { SearchField } from '../../../components/FinalForm/SearchField';
import { ENABLE_TEST_SCALES, printNodeMockedComputer } from '../../../constants';

export interface ComputerFieldProps {
  name: string;
  label?: JSX.Element | string;
}

export interface ComputerOption {
  label: string;
  value: number;
  computer: PrintNodeClient.ComputerResponse;
}

export const ComputerField: FC<ComputerFieldProps> = (props) => {
  const { api } = usePrintNode();
  const [options, setOptions] = useState<Array<ComputerOption>>([]);

  useEffect(() => {
    let isCanceled = false;
    (async function () {
      if (!api) {
        return;
      }

      const computers = await api.computers();

      if (ENABLE_TEST_SCALES) {
        computers.unshift(printNodeMockedComputer);
      }

      if (isCanceled) {
        return;
      }

      setOptions(
        computers.map((computer) => ({
          label: computer.name,
          value: computer.id,
          computer: computer,
        })),
      );
    })();

    return () => {
      isCanceled = true;
    };
  }, [api]);

  return (
    <SearchField
      name={props.name}
      label={props.label}
      options={options}
      InputComponent={LineTextField}
    />
  );
};
