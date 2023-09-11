import React, { forwardRef, useImperativeHandle } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { AnimatePresence } from 'framer-motion';
import { useBoolean, useKeyPress } from '@root/hooks';
import ClickOutHandler from '../ClickOutHandler/ClickOutHandler';
import { Dropdown } from '../Dropdown';
import { animationConfig } from './animationConfig';
import * as Styles from './styles';
import { IDropdownList, IDropdownListHandle } from './types';

const DropdownList: React.ForwardRefRenderFunction<IDropdownListHandle, IDropdownList> = (
  { children },
  ref,
) => {
  const [isVisible, handleOpen, handleHide] = useBoolean(false);

  useImperativeHandle(
    ref,
    () => {
      return {
        open: handleOpen,
      };
    },
    [handleOpen],
  );

  useKeyPress('Escape', handleHide);

  return (
    <ClickOutHandler onClickOut={isVisible ? handleHide : undefined}>
      <AnimatePresence>
        {isVisible ? (
          <Styles.DropdownContainer
            variants={animationConfig}
            initial="close"
            animate="open"
            exit="close"
          >
            <Layouts.Scroll width={300} maxHeight={250}>
              <Dropdown>{children}</Dropdown>
            </Layouts.Scroll>
          </Styles.DropdownContainer>
        ) : null}
      </AnimatePresence>
    </ClickOutHandler>
  );
};

export default forwardRef(DropdownList);
