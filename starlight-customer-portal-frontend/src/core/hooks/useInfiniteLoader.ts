import { useCallback, useEffect, useRef } from 'react';

import { useIntersectionObserver } from './useIntersectionObserver/useIntersectionObserver';

type InfiniteLoaderOptions = {
  loading: boolean;
  loaded: boolean;
  observableRef: React.MutableRefObject<HTMLElement | null>;
  initialRequest?: boolean;
  onRequest(): void;
};

export const useInfiniteLoader = ({
  onRequest,
  loaded,
  loading,
  observableRef,
  initialRequest,
}: InfiniteLoaderOptions) => {
  const initialized = useRef(false);

  const shouldLoading = !(loading && loaded);

  const handleObserve = useCallback(
    (element: IntersectionObserverEntry) => {
      if (shouldLoading && element?.isIntersecting) {
        onRequest();
      }
    },
    [onRequest, shouldLoading],
  );

  useEffect(() => {
    if (initialized.current === false && shouldLoading && initialRequest) {
      onRequest();
    }
    initialized.current = true;
  }, [initialRequest, onRequest, shouldLoading]);

  const intersectionObserverInstance = useIntersectionObserver(
    observableRef.current,
    handleObserve,
  );

  return intersectionObserverInstance;
};
