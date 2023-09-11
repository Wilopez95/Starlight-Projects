import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { getOffsets } from '@root/common/TableTools/TableQuickView/helpers';

interface IUseScrollContainerHeightOptions {
  containerRef?: React.MutableRefObject<HTMLElement | null>;
  parentRef?: React.MutableRefObject<HTMLElement | null>;
}

interface IUseScrollContainerHeightResponse {
  scrollContainerHeight: number;
  onAddRef: (ref: HTMLElement | null) => void;
}

type UseScrollContainerHeightType = ({
  containerRef,
  parentRef,
}: IUseScrollContainerHeightOptions) => IUseScrollContainerHeightResponse;

export const useScrollContainerHeight: UseScrollContainerHeightType = ({
  containerRef,
  parentRef,
}) => {
  const [scrollContainerHeight, setScrollContainerHeight] = useState(0);

  const refs = useRef<HTMLElement[]>([]);

  const parentOffsetTop = parentRef?.current?.offsetTop ?? 0;
  const containerHeight = containerRef?.current
    ? containerRef.current.clientHeight
    : document.body.clientHeight;

  const onAddRef = useCallback((ref: HTMLElement | null) => {
    if (ref === null) {
      refs.current = [];
    } else {
      refs.current.push(ref);
    }
  }, []);

  const resizeCallback = useCallback(() => {
    const offsets = getOffsets(refs.current);

    setScrollContainerHeight(containerHeight - parentOffsetTop - offsets);
  }, [containerHeight, parentOffsetTop]);

  const [debounceCallback] = useDebouncedCallback(resizeCallback, 16);

  useEffect(() => {
    window.addEventListener('resize', debounceCallback);
    resizeCallback();

    return () => {
      window.removeEventListener('resize', debounceCallback);
    };
  }, [debounceCallback, resizeCallback]);

  return {
    onAddRef,
    scrollContainerHeight,
  };
};
