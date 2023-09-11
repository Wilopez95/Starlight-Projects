import React, { useCallback, useEffect, useRef } from 'react';
import cx from 'classnames';
import { AnimatePresence, motion, Transition, Variants } from 'framer-motion';

import { ArrowIcon } from '../../assets';
import { useToggle } from '../../hooks';
import { Layouts } from '../../layouts';
import { ClickOutHandler } from '../ClickOutHandler';
import { Typography } from '../Typography/Typography';

import { ICollapsibleBar } from './types';

import styles from './css/styles.scss';

const variants: Variants = {
  open: { height: 'auto' },
  collapsed: { height: 0 },
};
const transition: Transition = {
  duration: 0.5,
};

const CollapsibleBar: React.FC<ICollapsibleBar> = ({
  label,
  children,
  open,
  absolute,
  containerClassName,
  beforeIconClassName,
  openedClassName,
  duration,
  marginizeArrow,
  arrowLeft,
  beforeIcon: BeforeIcon = null,
  shouldCloseOnClickOut = false,
}) => {
  const [isOpen, toggleOpen, setIsOpen] = useToggle(open);
  const initialized = useRef(isOpen);

  useEffect(() => {
    setIsOpen(!!open);
  }, [open, setIsOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const labelEl = (
    <Layouts.Box width="85%">
      <Typography variant="bodyLarge" color="grey" cursor="pointer">
        <Layouts.Flex alignItems="center" gap="5px">
          {BeforeIcon ? (
            <BeforeIcon className={cx(styles.beforeIcon, beforeIconClassName)} />
          ) : null}
          {label}
        </Layouts.Flex>
      </Typography>
    </Layouts.Box>
  );
  const arrowEl = (
    <ArrowIcon
      className={cx(styles.arrow, {
        [styles.open]: !isOpen,
        [styles.marginRight]: marginizeArrow || arrowLeft,
      })}
    />
  );

  return (
    <ClickOutHandler onClickOut={shouldCloseOnClickOut ? handleClose : undefined}>
      <div
        className={cx(
          styles.barContainer,
          { [styles.hidden]: !absolute },
          isOpen && openedClassName ? { [openedClassName]: isOpen } : {},
        )}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={toggleOpen}
          className={cx(styles.container, styles.arrowLeft, containerClassName)}
        >
          {arrowLeft ? (
            <>
              {arrowEl}
              {labelEl}
            </>
          ) : (
            <>
              {labelEl}
              {arrowEl}
            </>
          )}
        </div>
        <AnimatePresence>
          {isOpen ? (
            <Typography variant="bodyMedium" color="grey" cursor="pointer">
              <motion.ul
                variants={variants}
                initial={initialized.current ? 'open' : 'collapsed'}
                exit="collapsed"
                animate="open"
                className={absolute ? styles.absolute : undefined}
                transition={{ ...transition, duration: duration ?? transition.duration }}
                role="menu"
              >
                {children}
              </motion.ul>
            </Typography>
          ) : null}
        </AnimatePresence>
      </div>
    </ClickOutHandler>
  );
};

export default CollapsibleBar;
