import { useCallback, useState } from 'react';
import { TextInputElement } from '@starlightpro/shared-components';

export const useSearch = (initialValue = ''): UseSearchResult => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((e: React.ChangeEvent<TextInputElement>) => {
    setValue(e.target.value);
  }, []);

  return [value, handleChange, setValue];
};

type UseSearchResult = [
  string,
  (e: React.ChangeEvent<TextInputElement>) => void,
  (newValue: string) => void,
];
