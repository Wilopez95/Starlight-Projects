import { useEffect } from 'react';

import { BaseEntity } from '@root/stores/base/BaseEntity';
import { BaseStore } from '@root/stores/base/BaseStore';

export const useCleanup = (store: BaseStore<BaseEntity>) => {
  useEffect(
    () => () => {
      store.cleanup();
      store.unSelectEntity();
    },
    [store],
  );
};
