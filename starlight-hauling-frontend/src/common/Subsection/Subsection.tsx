import React from 'react';
import cx from 'classnames';

import { ISubsection } from './types';

import styles from './css/styles.scss';

export const Subsection: React.FC<ISubsection> = ({
  children,
  gray,
  title,
  hint,
  subsectionClassName,
  titleClassName,
  hintClassName,
}) => (
  <div className={cx(styles.subsection, { [styles.gray]: gray }, subsectionClassName)}>
    {title ? <div className={titleClassName ?? styles.title}>{title}</div> : null}
    {hint ? <div className={hintClassName ?? styles.hint}>{hint}</div> : null}
    {children}
  </div>
);
