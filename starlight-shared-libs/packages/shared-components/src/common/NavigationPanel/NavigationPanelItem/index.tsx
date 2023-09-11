import React from 'react';
import { NavLink } from 'react-router-dom';
import cx from 'classnames';

import { Layouts } from '../../../layouts';
import { Badge } from '../../Badge/Badge';
import CollapsibleBar from '../../CollapsibleBar/CollapsibleBar';
import { Typography } from '../../Typography/Typography';

import { INavigationPanelItem } from './types';

import styles from './css/styles.scss';

export const NavigationPanelItem: React.FC<INavigationPanelItem> = ({
  icon: Icon,
  children,
  title,
  badge,
  isActive,
  onClick,
  badgeColor = 'default',
  external = false,
  inner = false,
  active = false,
  exact = true,
  to = '/',
}) => {
  const isCollapsible = children && typeof children !== 'string';

  if (isCollapsible) {
    return (
      <li className={styles.navigationItemContainer} role="menuitem">
        <CollapsibleBar
          label={
            <Typography color="white" fontWeight="medium" className={styles.collapsibleLabel}>
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

  const linkContent = (
    <>
      <div className={styles.container}>
        {Icon ? <Icon className={styles.icon} /> : null}
        <div className={styles.label}>{children || title}</div>
      </div>
      {badge ? (
        <Badge borderRadius={8} color={badgeColor}>
          <Layouts.Padding right="1" left="1">
            <Typography color="white">{badge}</Typography>
          </Layouts.Padding>
        </Badge>
      ) : null}
    </>
  );

  return (
    <li
      className={cx(styles.navigationItem, {
        [styles.inner]: inner,
      })}
      role="menuitem"
    >
      {external ? (
        <a href={to} target="_blank" rel="noreferrer" onClick={onClick}>
          {linkContent}
        </a>
      ) : (
        <NavLink
          to={to}
          exact={exact}
          activeClassName={styles.active}
          className={styles.navLink}
          onClick={onClick}
          isActive={isActive}
          tabIndex={0}
        >
          {linkContent}
        </NavLink>
      )}
    </li>
  );
};
