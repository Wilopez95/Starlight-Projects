import React from 'react';
import { NavLink } from 'react-router-dom';
import { Badge, CollapsibleBar, Layouts, Typography } from '@starlightpro/shared-components';
import cx from 'classnames';

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
          label={title}
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
    <NavLink
      to={to}
      exact={exact}
      activeClassName={styles.active}
      onClick={onClick}
      isActive={isActive}
    >
      <li
        className={cx(styles.navigationItem, {
          [styles.inner]: inner,
        })}
        role='menuitem'
      >
        <div className={styles.container}>
          {Icon && <Icon className={styles.icon} />}
          <div className={styles.label}>{children || title}</div>
        </div>
        {badge && (
          <Badge borderRadius={8} color={badgeColor}>
            <Layouts.Padding right='1' left='1'>
              <Typography color='white'>{badge}</Typography>
            </Layouts.Padding>
          </Badge>
        )}
      </li>
    </NavLink>
  );
};
