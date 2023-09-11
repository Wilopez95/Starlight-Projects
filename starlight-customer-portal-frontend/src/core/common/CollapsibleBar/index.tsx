import React, { memo, useCallback, useEffect, useRef } from 'react';
import { ClickOutHandler, Layouts, Typography } from '@starlightpro/shared-components';
import cx from 'classnames';
import { AnimatePresence, motion, Transition, Variants } from 'framer-motion';

import { ArrowIcon } from '@root/assets';
import { useToggle } from '@root/core/hooks';

import { ICollapsibleBar } from './types';

import styles from './css/styles.scss';

const variants: Variants = {
  open: { height: 'auto' },
  collapsed: { height: 0 },
};
const transition: Transition = {
  duration: 0.5,
};

const CollapsibleBarComponent: React.FC<ICollapsibleBar> = ({
  label,
  children,
  open,
  absolute,
  containerClassName,
  beforeIconClassName,
  closeOnClickOut = false,
  beforeIcon: BeforeIcon = null,
}) => {
  const [isOpen, toggleOpen, setIsOpen] = useToggle(open);
  const initialized = useRef(isOpen);

  useEffect(() => {
    setIsOpen(!!open);
  }, [open, setIsOpen]);

  const onCLickOut = useCallback(() => {
    if (closeOnClickOut) {
      setIsOpen(false);
    }
  }, [closeOnClickOut, setIsOpen]);

  return (
    <ClickOutHandler onClickOut={onCLickOut}>
      <ul className={cx(styles.barContainer, { [styles.hidden]: !absolute })}>
        <li role='button' onClick={toggleOpen} className={cx(styles.container, containerClassName)}>
          <Typography variant='bodyLarge' color='grey' cursor='pointer'>
            <Layouts.Flex alignItems='center'>
              {BeforeIcon && <BeforeIcon className={cx(styles.beforeIcon, beforeIconClassName)} />}
              {label}
            </Layouts.Flex>
          </Typography>
          <ArrowIcon className={cx(styles.arrow, { [styles.open]: !isOpen })} />
        </li>
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              variants={variants}
              initial={initialized.current ? 'open' : 'collapsed'}
              exit='collapsed'
              animate='open'
              className={absolute ? styles.absolute : undefined}
              transition={transition}
            >
              <Typography variant='bodyMedium' color='grey' cursor='pointer'>
                {children}
              </Typography>
            </motion.ul>
          )}
        </AnimatePresence>
      </ul>
    </ClickOutHandler>
  );
};

export const CollapsibleBar: React.FC<ICollapsibleBar> = memo(CollapsibleBarComponent);
