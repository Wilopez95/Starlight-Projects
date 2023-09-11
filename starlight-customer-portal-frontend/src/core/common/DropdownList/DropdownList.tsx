import React, { forwardRef, useImperativeHandle } from 'react';
import { Layouts, ClickOutHandler } from '@starlightpro/shared-components';
import { AnimatePresence } from 'framer-motion';

import { useBoolean } from '@root/core/hooks';

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

  return (
    <ClickOutHandler onClickOut={isVisible ? handleHide : undefined}>
      <AnimatePresence>
        {isVisible && (
          <Styles.DropdownContainer
            variants={animationConfig}
            initial='close'
            animate='open'
            exit='close'
          >
            <Layouts.Box width='300px' maxHeight='250px'>
              <Dropdown>{children}</Dropdown>
            </Layouts.Box>
          </Styles.DropdownContainer>
        )}
      </AnimatePresence>
    </ClickOutHandler>
  );
};

export default forwardRef(DropdownList);
