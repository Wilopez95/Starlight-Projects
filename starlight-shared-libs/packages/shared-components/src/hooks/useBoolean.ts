import { useCallback, useState } from 'react';

export const useBoolean = (initialValue = false): UseBooleanResult => {
  const [value, setValue] = useState(initialValue);
  const setTrue = useCallback(() => {
    setValue(true);
  }, []);
  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, setTrue, setFalse];
};

type UseBooleanResult = [boolean, () => void, () => void];
