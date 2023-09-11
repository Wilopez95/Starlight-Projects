import { useEffect, useRef } from 'react';

type RafIntervalRef = Record<'id', number | undefined>;

const setRafInterval = (callback: () => unknown, interval = 0) => {
  let start = Date.now();
  const rafIntervalIdRef: RafIntervalRef = { id: -1 };

  const loop = () => {
    rafIntervalIdRef.id = requestAnimationFrame(loop);

    if (Date.now() - start >= interval) {
      callback();
      start = Date.now();
    }
  };

  rafIntervalIdRef.id = requestAnimationFrame(loop);

  return rafIntervalIdRef;
};

const clearRafInterval = (data: RafIntervalRef) => {
  cancelAnimationFrame(data.id ?? -1);
};

export const usePolling = (callback: () => unknown, interval?: number | null) => {
  const savedCallback = useRef<() => unknown>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      savedCallback.current?.();
    };

    let rafIntervalIdRef: RafIntervalRef = { id: -1 };

    if (interval !== null && interval !== undefined) {
      rafIntervalIdRef = setRafInterval(tick, interval);

      return () => {
        clearRafInterval(rafIntervalIdRef);
      };
    } else {
      clearRafInterval(rafIntervalIdRef);
    }
  }, [interval, callback]);
};
