import React, { Fragment, memo } from 'react';
import cx from 'classnames';

import { IOptionGroup } from './types';

import styles from './css/styles.scss';

const OptionGroupComponent: React.FC<IOptionGroup> = ({
  children,
  image: Image = Fragment,
  title,
  hiddenHeader = false,
  elementWrapperClassName,
}) => {
  return (
    <>
      {!hiddenHeader && (
        <div className={styles.header}>
          <Image />
          <div className={styles.title}>{title}</div>
        </div>
      )}
      <ul className={cx(styles.items, elementWrapperClassName)}>{children}</ul>
    </>
  );
};

export const OptionGroup = memo(OptionGroupComponent);
