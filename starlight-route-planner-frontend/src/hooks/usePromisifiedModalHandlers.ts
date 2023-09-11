import React, { useState } from 'react';

type TStateLike = Record<string, unknown>;

export const usePromisifiedModalHandlers = <
  T = TStateLike,
  R extends TStateLike = TStateLike,
>() => {
  const [modalData, setModalData] = useState<T | undefined>(undefined);

  const awaitingPromiseRef = React.useRef<{
    resolve: (state: boolean) => void;
    reject: (state: boolean) => void;
  }>();

  const handleOpen = (data: T = {} as T) => {
    setModalData(data);

    return new Promise((resolve: (state: boolean) => void, reject: (state: boolean) => void) => {
      awaitingPromiseRef.current = { resolve, reject };
    });
  };

  const handleClose = async (callback?: (args: T & R) => Promise<void>, args: R = {} as R) => {
    if (!modalData) {
      return;
    }

    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.reject(false);
    }

    setModalData(undefined);

    if (callback) {
      await callback({ ...args, ...modalData });
    }
  };

  const handleSubmit = async (callback?: (args: T & R) => Promise<void>, args: R = {} as R) => {
    if (!modalData) {
      return;
    }

    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve(true);
    }

    setModalData(undefined);

    if (callback) {
      await callback({ ...args, ...modalData });
    }
  };

  return {
    modalData,
    handleOpen,
    handleSubmit,
    handleClose,
  };
};
