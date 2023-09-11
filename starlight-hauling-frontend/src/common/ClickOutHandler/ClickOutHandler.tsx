import React, { memo, useCallback, useEffect, useRef } from 'react';
import { noop } from 'lodash-es';

import { ClickOutHandlerCallback, IClickOutHandler } from './types';

const events = ['mousedown', 'touchstart'];

const ClickOutHandler: React.FC<IClickOutHandler> = ({
  onClickOut,
  children,
  skipModal,
  className,
  skipNotification = true,
  skipCalendar = true,
  subContainers = [],
  clickOutSelectors = [],
}) => {
  const wrapper = useRef<HTMLDivElement>(null);

  const handleClick: ClickOutHandlerCallback = useCallback(
    (event: MouseEvent) => {
      if (!onClickOut || onClickOut === noop) {
        return;
      }

      const eventElements = event.composedPath() as Element[];

      // skip click for browser elements (scroll)
      // in this case eventElements[0] === html
      if (eventElements[0] === document.body.parentNode) {
        return;
      }

      if (
        skipModal &&
        eventElements.find(element => element.classList?.contains('ReactModalPortal'))
      ) {
        return;
      }

      if (
        skipNotification &&
        eventElements.find(element => element.classList?.contains('Toastify__toast'))
      ) {
        return;
      }

      if (
        skipCalendar &&
        eventElements.find(element => element.classList?.contains('flatpickr-calendar'))
      ) {
        return;
      }

      const containers: React.RefObject<HTMLElement | null>[] = [wrapper];
      const clickOutSelectorsArray = Array.isArray(clickOutSelectors)
        ? clickOutSelectors
        : [clickOutSelectors];

      if (Array.isArray(subContainers)) {
        containers.push(...subContainers);
      } else {
        containers.push(subContainers);
      }

      const isContainerIncludedInEventPath = containers.some(containerRef => {
        const container = containerRef.current;

        if (!container) {
          return false;
        }
        if (eventElements.includes(container)) {
          return true;
        }

        return container.contains(event.target as Node);
      });

      if (isContainerIncludedInEventPath) {
        return;
      }

      const isSelectorFind = clickOutSelectorsArray.some(newClassName => {
        let find = false;

        document.querySelectorAll(newClassName).forEach(item => {
          if (find) {
            return;
          }
          find = item.contains(event.target as Node);
        });

        return find;
      });

      if (isSelectorFind) {
        return;
      }

      // if click was not inside any of the containers, call onClickOut
      onClickOut(event);
    },
    [clickOutSelectors, onClickOut, skipModal, skipNotification, skipCalendar, subContainers],
  );

  useEffect(() => {
    events.forEach(e => document.addEventListener(e, () => handleClick));

    return () => {
      events.forEach(e => document.removeEventListener(e, () => handleClick));
    };
  }, [handleClick]);

  return (
    <div ref={wrapper} className={className}>
      {children}
    </div>
  );
};

export default memo(ClickOutHandler);
