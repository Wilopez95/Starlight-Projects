import React, { useCallback } from 'react';
import cx from 'classnames';

import history from '../../history';

import { INotificationWithLink } from './types';

import styles from './css/styles.scss';

export const NotificationWithLink: React.FC<INotificationWithLink> = React.memo(
  ({ uri, className, linkClassName, label, text }) => {
    const handleClick = useCallback(() => {
      history.push({ pathname: uri });
    }, [uri]);

    return (
      <span className={className}>
        {text}
        <a
          onClick={handleClick}
          title={label}
          aria-label={label}
          className={cx(styles.link, linkClassName)}
        >
          {label}
        </a>
      </span>
    );
  },
);
