import { useCallback, useEffect, useRef } from 'react';

import { useStores } from '@root/hooks';
import { BaseEntity } from '@root/stores/base/BaseEntity';

export const useDuplicate = <T>(
  getValues: () => T,
  activeItem: BaseEntity | null,
): [T, (values: T) => void, (values: T) => void] => {
  const { systemConfigurationStore } = useStores();
  const duplicate = useRef<T>(getValues());

  const setInitialDuplicate = useCallback((values: T) => {
    duplicate.current = values;
  }, []);

  useEffect(() => {
    if (activeItem) {
      setInitialDuplicate(getValues());
    }
  }, [activeItem, getValues, setInitialDuplicate]);

  const setDuplicate = useCallback(
    (values: T) => {
      duplicate.current = values;
      systemConfigurationStore.togglePreDuplicating(false);
      systemConfigurationStore.toggleDuplicating(true);
    },
    [systemConfigurationStore],
  );

  return [duplicate.current, setDuplicate, setInitialDuplicate];
};
