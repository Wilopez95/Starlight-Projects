import React from 'react';
import { NavLink } from 'react-router-dom';
import { CollapsibleBar, Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';

import { Badge } from '../../Badge/Badge';
import { Typography } from '../../Typography/Typography';

import { INavigationPanelItem } from './types';

import styles from './css/styles.scss';

export const NavigationPanelItem: React.FC<INavigationPanelItem> = ({
  icon: Icon,
  children,
  title,
  badge,
  onClick,
  isActive,
  badgeColor = 'default',
  inner = false,
  active = false,
  to = '/',

  exact = true,
}) => {
  const isCollapsible = children && typeof children !== 'string';

  if (isCollapsible) {
    return (
      <li className={styles.navigationItemContainer}>
        <CollapsibleBar
          label={
            <Typography color="white" fontWeight="medium">
              {title}
            </Typography>
          }
          open={active}
          beforeIcon={Icon}
          containerClassName={styles.buttonContainer}
        >
          {children}
        </CollapsibleBar>
      </li>
    );
  }

  return (
    <li
      className={cx(styles.navigationItem, {
        [styles.inner]: inner,
      })}
      role="menuitem"
    >
      <NavLink
        to={to}
        exact={exact}
        activeClassName={styles.active}
        className={styles.navLink}
        onClick={onClick}
        isActive={isActive}
        tabIndex={0}
      >
        <div className={styles.container}>
          {Icon ? <Icon className={styles.icon} /> : null}
          <div className={styles.label}>{children ?? title}</div>
        </div>
        {badge ? (
          <Badge borderRadius={8} color={badgeColor}>
            <Layouts.Padding right="1" left="1">
              <Typography color="white">{badge}</Typography>
            </Layouts.Padding>
          </Badge>
        ) : null}
      </NavLink>
    </li>
  );
};
