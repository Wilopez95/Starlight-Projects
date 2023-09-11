import React, { useCallback } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { xor } from 'lodash-es';

import { Typography } from '@root/common';

import { INewRecurrentOrder } from '../../../../types';

import * as Styles from './styles';

// TODO: take in count that week could start from Monday
const week = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const WeekPicker: React.FC = () => {
  const { values, errors, setFieldValue } = useFormikContext<INewRecurrentOrder>();

  const handleDaySelect = useCallback(
    (day: number) => {
      setFieldValue(
        'recurrentTemplateData.frequencyDays',
        xor(values.recurrentTemplateData.frequencyDays ?? [], [day]),
      );
    },
    [setFieldValue, values.recurrentTemplateData.frequencyDays],
  );

  return (
    <Layouts.Flex as={Layouts.Margin} top={3} direction="column">
      <Layouts.Flex alignItems="center">
        {week.map((day, index) => {
          const isSelected = values.recurrentTemplateData.frequencyDays?.includes(index);

          return (
            <Styles.StyledWrapper
              key={day}
              alignItems="center"
              justifyContent="center"
              className={isSelected ? 'selected' : undefined}
              onClick={() => handleDaySelect(index)}
            >
              <Typography variant="bodyLarge">{day}</Typography>
            </Styles.StyledWrapper>
          );
        })}
      </Layouts.Flex>
      <Layouts.Margin top="0.5">
        <Typography variant="bodySmall" color="alert">
          {errors.recurrentTemplateData?.frequencyDays}
        </Typography>
      </Layouts.Margin>
    </Layouts.Flex>
  );
};

export default WeekPicker;
