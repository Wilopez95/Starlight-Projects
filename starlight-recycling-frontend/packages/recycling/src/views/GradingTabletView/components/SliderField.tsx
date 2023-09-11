import React, { FC, memo } from 'react';
import { useField } from 'react-final-form';
import { Slider, SliderProps } from '@material-ui/core';

interface Props extends SliderProps {
  name: string;
}

export const SliderField: FC<Props> = memo((props) => {
  const { name } = props;

  const {
    input: { value, onChange },
  } = useField<number>(name, {
    subscription: { value: true },
  });

  return (
    <Slider
      getAriaValueText={() => `${value}%`}
      aria-labelledby="discrete-slider"
      valueLabelDisplay="auto"
      {...props}
      value={value}
      onChange={(_, v) => onChange(v)}
    />
  );
});
