import React, { forwardRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';

import { Loadable } from '../Loadable/Loadable';

import { IRoutingNavigation } from './types';

import styles from './css/styles.scss';

export const RoutingNavigation = forwardRef<HTMLDivElement | null, IRoutingNavigation>(
  ({ routes, withEmpty, className, direction = 'row' }, ref) => {
    // const flexProps: IFlexLayout =
    const flexProps: any =
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

    return (
      <Layouts.Flex
        {...flexProps}
        as={Layouts.Box}
        scrollX='hidden'
        scrollY='hidden'
        backgroundColor='white'
        width='100%'
        className={className}
        ref={ref}
      >
        {routes.map((props) => {
          if (props.loading) {
            return (
              <div className={loadingCellClassName} key={props.content}>
                <Loadable width={props.width ?? 100} />
              </div>
            );
          }

          return (
            <NavLink
              onClick={props.disabled ? handleLinkClick : undefined}
              key={props.to}
              to={props.to}
              activeClassName={styles.selected}
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
        {withEmpty && <div className={emptyCellClassName} />}
      </Layouts.Flex>
    );
  },
);
