import React, { memo, useCallback, useEffect, useRef } from 'react';

const events = ['touchstart', 'mouseenter'];

export interface TouchOutTooltipHandlerProps {
  children: React.ReactNode;
  onTouchOut?(event?: any): void;
  onTouchStart?(event?: any): void;
}

export type TouchOutTooltipHandlerCallback = (e: any) => void;

const TouchOutTooltipHandler: React.FC<TouchOutTooltipHandlerProps> = ({
  onTouchOut,
  onTouchStart = () => {},
  children,
}) => {
  const wrapper = useRef<HTMLDivElement | null>(null);

  const handleClick: TouchOutTooltipHandlerCallback = useCallback(
    (event: TouchEvent) => {
      if (!onTouchOut) {
        return;
      }

      const eventElements = event.composedPath() as Element[];

      // skip click for browser elements (scroll)
      // in this case eventElements[0] === html
      if (eventElements[0] === document.body.parentNode) {
        return;
      }

      const isContainerIncludedInEventPath =
        wrapper?.current &&
        (eventElements.includes(wrapper.current!) ||
          wrapper.current!.contains(event.target as Node));

      if (isContainerIncludedInEventPath) {
        return;
      }

      // if click was not inside any of the containers, call onClickOut
      onTouchOut(event);
    },
    [onTouchOut, wrapper],
  );

  useEffect(() => {
    events.forEach((e) => document.addEventListener(e, handleClick));

    return () => {
      events.forEach((e) => document.removeEventListener(e, handleClick));
    };
  }, [handleClick]);

  return (
    <span onTouchStart={onTouchStart} ref={wrapper}>
      {children}
    </span>
  );
};

export default memo(TouchOutTooltipHandler);
