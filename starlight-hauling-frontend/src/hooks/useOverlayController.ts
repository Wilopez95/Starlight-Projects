import { useCallback, useContext, useState } from 'react';

import { OverlayControllerContext } from '@root/components/OverlayControllerContext/OverlayControllerContext';

export const useOverlayController = (): [number, () => void, () => void] => {
  const { registerOverlay, unregisterOverlay, defaultZIndex } =
    useContext(OverlayControllerContext);
  const [zIndex, setZIndex] = useState(defaultZIndex);

  const handleRegister = useCallback(() => {
    const index = registerOverlay();

    setZIndex(index);
  }, [registerOverlay]);

  return [zIndex, handleRegister, unregisterOverlay];
};
