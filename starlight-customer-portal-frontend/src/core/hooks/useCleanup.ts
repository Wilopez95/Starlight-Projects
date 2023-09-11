import { useEffect } from 'react';

import { BaseEntity } from '@root/core/stores/base/BaseEntity';
import type { BaseStore } from '@root/core/stores/base/BaseStore';

export const useCleanup = (store: BaseStore<BaseEntity>, callback?: () => void) => {
  useEffect(() => {
    return () => {
      store.cleanup();
      store.unSelectEntity(callback);
    };
  }, [callback, store]);
};
