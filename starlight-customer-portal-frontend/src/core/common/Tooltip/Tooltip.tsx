import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Container, TooltipLayout } from './styles';
import { ITooltip } from './types';

export const Tooltip: React.FC<ITooltip> = ({
  children,
  text,
  wrapperClassName,
  fullWidth,
  border,
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

  const setActiveState = (value: boolean) => {
    setActive(value);
    activeRef.current = value;
  };

  const transitionEndCallback = useCallback(() => {
    el.current.removeEventListener('transitionend', transitionEndCallback);
    setActiveState(false);
  }, []);

  const onRemove = useCallback(() => {
    clearTimeout(renderTimer.current as number);
    el.current.addEventListener('transitionend', transitionEndCallback);
  }, [transitionEndCallback]);

  const onLeave = useCallback(() => {
    if (activeRef.current) {
      setHidden(true);
      requestAnimationFrame((timestamp) => {
        if (timestamp > delay) {
          onRemove();
        }
      });
    }
  }, [delay, onRemove]);

  const el = useRef(document.createElement('div'));

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
        let newPos: undefined | { x: number; y: number } = undefined;

        const coordinates = {
          left: {
            x: rect.left - (tooltipRect?.width ?? 0 + arrow),
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

        newPos = coordinates[position];

        if (!newPos) {
          console.error('strange position');

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
    (e: React.MouseEvent) => {
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
      fullWidth={fullWidth}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={wrapperClassName}
      ref={wrapper}
      withBorder={border}
      width='16px'
    >
      {children}
      {active &&
        el &&
        createPortal(
          <TooltipLayout
            role='tooltip'
            ref={toolTip}
            position={position}
            hidden={hidden}
            posX={`${pos.x}px`}
            posY={`${pos.y}px`}
          >
            {text}
          </TooltipLayout>,
          el.current,
        )}
    </Container>
  );
};
