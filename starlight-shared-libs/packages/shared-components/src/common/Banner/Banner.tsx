import React from 'react';
import cx from 'classnames';

import { useToggle } from '../../hooks';
import { Layouts } from '../../layouts';
import { Typography } from '../Typography/Typography';

import { IBanner } from './types';

import styles from './css/styles.scss';

export const Banner: React.FC<IBanner> = ({
  children,
  removable,
  showIcon = true,
  className,
  color = 'primary',
  textVariant = 'bodyMedium',
}) => {
  const [isBannerVisible, showBanner] = useToggle(true);

  const currentColor = styles[color];

  return isBannerVisible ? (
    <Layouts.Box
      backgroundColor={color}
      backgroundShade="desaturated"
      className={cx(styles.banner, className)}
    >
      <Layouts.Padding padding="2" left="3" right="3">
        <Typography color={color} variant={textVariant}>
          <Layouts.Flex>
            {showIcon ? (
              <div className={cx(styles.icon, currentColor)}>
                <span>!</span>
              </div>
            ) : null}
            {removable ? (
              <span className={styles.closeIcon} onClick={showBanner}>
                &times;
              </span>
            ) : null}
            {children}
          </Layouts.Flex>
        </Typography>
      </Layouts.Padding>
    </Layouts.Box>
  ) : null;
};
