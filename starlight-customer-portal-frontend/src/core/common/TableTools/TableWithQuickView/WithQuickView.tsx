import React, { useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';

import { WithQuickViewChildProps } from './types';

// eslint-disable-next-line @typescript-eslint/ban-types
export const withQuickView = <P extends object>(BaseComponent: React.FC<P>) => {
  const wrappedComponent: React.FC<WithQuickViewChildProps<P>> = ({
    children,
    condition,
    onClose,
    shouldDeselect = true,
    ...props
  }) => {
    // valid in HOC
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const handleAnimationComplete = useCallback(() => {
      if (shouldDeselect) {
        props.store?.unSelectEntity(onClose);
      } else {
        onClose?.();
      }
    }, [props.store, onClose, shouldDeselect]);

    return (
      <AnimatePresence onExitComplete={handleAnimationComplete}>
        {condition && (
          <BaseComponent {...((props as unknown) as P)} onClose={onClose}>
            {children}
          </BaseComponent>
        )}
      </AnimatePresence>
    );
  };

  wrappedComponent.displayName = `WithQuickView(${
    BaseComponent.displayName || BaseComponent.name
  })`;

  return wrappedComponent;
};
