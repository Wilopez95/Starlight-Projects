import React, { createContext, useCallback, useMemo, useRef } from 'react';
import { noop } from 'lodash-es';

interface IOverlayControllerContext {
  defaultZIndex: number;
  registerOverlay: () => number;
  unregisterOverlay: () => void;
}
const defaultZIndex = 100;

export const OverlayControllerContext = createContext<IOverlayControllerContext>({
  defaultZIndex,
  registerOverlay: () => 0,
  unregisterOverlay: noop,
});

export const OverlayControllerProvider: React.FC = ({ children }) => {
  const currentZIndex = useRef(defaultZIndex);

  const registerOverlay = useCallback(() => {
    currentZIndex.current += 1;

    return currentZIndex.current;
  }, []);

  const unregisterOverlay = useCallback(() => {
    currentZIndex.current -= 1;
  }, []);

  const contextValue: IOverlayControllerContext = useMemo(() => {
    return {
      defaultZIndex,
      registerOverlay,
      unregisterOverlay,
    };
  }, [registerOverlay, unregisterOverlay]);

  return (
    <OverlayControllerContext.Provider value={contextValue}>
      {children}
    </OverlayControllerContext.Provider>
  );
};
