import React, { forwardRef, useCallback } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { IFlexLayout, Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';

import { handleEnterOrSpaceKeyDown } from '@root/helpers';

import { Loadable } from '../Loadable/Loadable';

import { IRoutingNavigation, RoutingNavigationItem } from './types';

import styles from './css/styles.scss';

export const RoutingNavigation = forwardRef<HTMLDivElement | null, IRoutingNavigation>(
  ({ routes, withEmpty, className, onRouteChange, direction = 'row' }, ref) => {
    const history = useHistory();

    const flexProps: IFlexLayout =
      direction === 'row'
        ? {
            direction: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
          }
        : {
            direction: 'column',
            alignItems: 'flex-start',
          };

    const directionClass = styles[direction];

    const loadingCellClassName = cx(styles.tabGroupItem, directionClass, {
      [styles.border]: true,
    });

    const emptyCellClassName = cx(styles.tabGroupItem, directionClass, styles.empty, {
      [styles.border]: true,
    });

    const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault();
    }, []);

    const handleKeyPress = (e: React.KeyboardEvent, to: string) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onRouteChange?.();
        history.push(to);
      }
    };

    return (
      <Layouts.Flex
        {...flexProps}
        as={Layouts.Box}
        backgroundColor="white"
        width="100%"
        className={className}
        ref={ref}
      >
        {routes.map((props: RoutingNavigationItem) => {
          if (props.loading) {
            return (
              <div className={loadingCellClassName} key={props.content}>
                <Loadable width={props.width ?? 100} />
              </div>
            );
          }

          return (
            <NavLink
              onClick={props.disabled ? handleLinkClick : onRouteChange}
              key={props.to}
              to={props.to}
              activeClassName={styles.selected}
              onKeyUp={(e: React.KeyboardEvent) => handleKeyPress(e, props.to)}
              className={cx(styles.tabGroupItem, directionClass, {
                [styles.border]: true,
                [styles.disabled]: props.disabled,
              })}
              tabIndex={0}
            >
              {props.content}
            </NavLink>
          );
        })}
        {withEmpty ? <div className={emptyCellClassName} /> : null}
      </Layouts.Flex>
    );
  },
);
