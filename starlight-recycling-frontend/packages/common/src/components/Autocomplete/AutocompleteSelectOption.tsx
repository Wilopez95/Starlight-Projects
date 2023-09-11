import React, { useRef, forwardRef, useEffect, useState } from 'react';
import useForkRef from '@material-ui/core/utils/useForkRef';

import SelectOption, { SelectOptionProps } from '../SelectOption';

export interface AutocompleteOptionFocuseContextType {
  value?: any;
}

export const AutocompleteOptionFocuseContext = React.createContext<
  AutocompleteOptionFocuseContextType
>({ value: undefined });

interface WappedOptionProps extends SelectOptionProps {
  focusedValue?: any;
}

const WappedOption = forwardRef<any, WappedOptionProps>(({ focusedValue, ...props }, ref) => {
  const optionRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const handleRef = useForkRef(optionRef, ref);
  const value = props.value;

  useEffect(() => {
    const nextFocused = focusedValue && value === focusedValue;

    if (focused !== nextFocused) {
      setFocused(nextFocused);
    }
  }, [value, focusedValue, focused, setFocused]);

  return <SelectOption {...props} ref={handleRef} focused={focused} />;
});

export const AutocompleteSelectOption = forwardRef<any, SelectOptionProps>((props, ref) => {
  return (
    <AutocompleteOptionFocuseContext.Consumer>
      {({ value: focusedValue }) => {
        return <WappedOption {...props} ref={ref} focusedValue={focusedValue} />;
      }}
    </AutocompleteOptionFocuseContext.Consumer>
  );
});
