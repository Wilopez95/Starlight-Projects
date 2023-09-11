import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as Sentry from '@sentry/react';

import { Container, TooltipLayout } from './styles';
import { ITooltip } from './types';

export const Tooltip: React.FC<ITooltip> = ({
  children,
  text,
  wrapperClassName,
  fullWidth,
  border,
  normalizeTypography,
  borderColor,
  borderShade,
  inline,
  delay = 200,
  position = 'left',
}) => {
  const [active, setActive] = useState(false);
  const toolTip = useRef<HTMLDivElement | null>(null);
  const renderTimer = useRef<NodeJS.Timeout | number | null>(null);
  const wrapper = useRef(null);
  const [hidden, setHidden] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const activeRef = React.useRef(active);

  useEffect(() => {
    return () => {
      clearTimeout(renderTimer.current as number);
    };
  }, []);
  const el = useRef(document.createElement('div'));

  const setActiveState = (value: boolean) => {
    setActive(value);
    activeRef.current = value;
  };

  const transitionEndCallback = useCallback(() => {
    el.current.removeEventListener('transitionend', transitionEndCallback);
  }, []);

  const onRemove = useCallback(() => {
    clearTimeout(renderTimer.current as number);
    el.current.addEventListener('transitionend', transitionEndCallback);
    setActiveState(false);
  }, [transitionEndCallback]);

  const onLeave = useCallback(() => {
    if (activeRef.current) {
      setHidden(true);
      requestAnimationFrame(timestamp => {
        if (timestamp > delay) {
          onRemove();
        }
      });
    }
  }, [delay, onRemove]);

  useEffect(() => {
    const mount = document.getElementById('portal-root');
    const popup = el.current;

    mount?.appendChild(popup);
    window.addEventListener('scroll', onLeave);

    return () => {
      mount?.removeChild(popup);
      window.removeEventListener('scroll', onLeave);
    };
  }, [onLeave]);

  const setPosition = useCallback(
    (rect: DOMRect) => {
      const tooltipRect = toolTip.current?.getBoundingClientRect();
      const arrow = 5;

      setPos(() => {
        let newPos: undefined | { x: number; y: number };

        const coordinates = {
          left: {
            x: rect.left - ((tooltipRect?.width ?? 0) + arrow),
            y: rect.top + rect.height / 2 - (tooltipRect?.height ?? 0) / 2,
          },
          right: {
            x: rect.left + (rect.width + arrow),
            y: rect.top + rect.height / 2 - (tooltipRect?.height ?? 0) / 2,
          },
          top: {
            x: rect.left + rect.width / 2 - (tooltipRect?.width ?? 0) / 2,
            y: rect.top - arrow - (tooltipRect?.height ?? 0),
          },
          bottom: {
            x: rect.left + rect.width / 2 - (tooltipRect?.width ?? 0) / 2,
            y: rect.top + rect.height + arrow,
          },
        };

        // eslint-disable-next-line prefer-const
        newPos = coordinates[position];

        if (newPos === undefined) {
          Sentry.captureMessage('Tooltip strange position');

          return { x: 0, y: 0 };
        } else {
          if (newPos.x < arrow) {
            newPos.x = arrow;
          }
          if (newPos.y < arrow) {
            newPos.y = arrow;
          }
        }

        return {
          x: newPos.x + window.scrollX,
          y: newPos.y + window.scrollY,
        };
      });

      setHidden(false);
    },
    [position],
  );

  const onHover = useCallback(
    (e: React.MouseEvent | React.FocusEvent) => {
      if (!active) {
        const rect = e.currentTarget.getBoundingClientRect();

        setActiveState(true);
        setHidden(true);
        renderTimer.current = setTimeout(() => setPosition(rect), 16);
      }
    },
    [active, setPosition],
  );

  return (
    <Container
      tabIndex={0}
      fullWidth={fullWidth}
      onMouseEnter={onHover}
      onFocus={onHover}
      onMouseLeave={onLeave}
      onBlur={onLeave}
      className={wrapperClassName}
      ref={wrapper}
      border={border}
      borderColor={borderColor}
      borderShade={borderShade}
      normalizeTypography={normalizeTypography}
      inline={inline}
    >
      {children}
      {active && text && el
        ? createPortal(
            <TooltipLayout
              role="tooltip"
              ref={toolTip}
              position={position}
              hidden={hidden}
              posX={`${pos.x}px`}
              posY={`${pos.y}px`}
            >
              {text}
            </TooltipLayout>,
            el.current,
          )
        : null}
    </Container>
  );
};
