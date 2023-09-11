import React, { useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';

import { WithQuickViewChildProps } from './types';

// eslint-disable-next-line @typescript-eslint/ban-types
export const withQuickView = <P extends object>(BaseComponent: React.FC<P>) => {
  const wrappedComponent: React.FC<WithQuickViewChildProps<P>> = ({
    children,
    condition,
    shouldDeselect = true,
    ...props
  }) => {
    // valid in HOC
    const handleAnimationComplete = useCallback(() => {
      props.store?.unSelectEntity(props.onClose);
    }, [props.onClose, props.store]);

    return (
      <AnimatePresence onExitComplete={shouldDeselect ? handleAnimationComplete : undefined}>
        {condition && <BaseComponent {...(props as unknown as P)}>{children}</BaseComponent>}
      </AnimatePresence>
    );
  };

  wrappedComponent.displayName = `WithQuickView(${
    BaseComponent.displayName ?? BaseComponent.name
  })`;

  return wrappedComponent;
};
