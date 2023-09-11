import React from 'react';
import cx from 'classnames';

import { ArrowIcon } from '../../assets';
import { Typography } from '../Typography/Typography';

import { IAccordion } from './types';

import styles from './css/styles.scss';

export const Accordion: React.FC<IAccordion> = ({
  label,
  children,
  containerClassName,
  headerClassName,
  isOpen,
  toggleOpen,
  actionButton,
}) => {
  return (
    <div className={containerClassName}>
      <div
        role="button"
        onClick={toggleOpen}
        className={cx(styles.accordionHeader, headerClassName)}
      >
        <ArrowIcon
          className={cx(styles.arrow, {
            [styles.open]: !isOpen,
          })}
        />
        <Typography variant="headerFive" cursor="pointer">
          {label}
        </Typography>
        {actionButton}
      </div>
      {isOpen ? (
        <Typography variant="bodyMedium" color="grey">
          {children}
        </Typography>
      ) : null}
    </div>
  );
};
