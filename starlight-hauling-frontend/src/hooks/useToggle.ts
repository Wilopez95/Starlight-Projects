import { useCallback, useState } from 'react';

export const useToggle = (
  defaultValue = false,
): [boolean, () => void, (value: boolean) => void] => {
  const [value, setValue] = useState(defaultValue);

  const handleToggle = useCallback(() => {
    setValue(s => !s);
  }, []);

  return [value, handleToggle, setValue];
};
