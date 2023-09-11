import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';

import { EditIcon } from '@root/assets';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useToggle } from '@root/hooks';

import { Typography } from '../Typography/Typography';

import { IBanner } from './types';

import styles from './css/styles.scss';

export const Banner: React.FC<IBanner> = ({
  children,
  removable,
  showIcon = true,
  className,
  onEdit,
  color = 'primary',
  textVariant = 'bodyMedium',
}) => {
  const [isBannerVisible, showBanner] = useToggle(true);
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onEdit?.();
      }
    },
    [onEdit],
  );

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
            {onEdit ? (
              <Layouts.Box width="100px">
                <Typography
                  className={styles.edit}
                  onClick={onEdit}
                  color="information"
                  variant="bodyLarge"
                >
                  <Layouts.IconLayout width="20px" height="20px">
                    <EditIcon
                      role="button"
                      aria-label={t('Text.Edit')}
                      tabIndex={0}
                      onKeyDown={handleKeyDown}
                    />
                  </Layouts.IconLayout>
                  {t('Text.Edit')}
                </Typography>
              </Layouts.Box>
            ) : null}
          </Layouts.Flex>
        </Typography>
      </Layouts.Padding>
    </Layouts.Box>
  ) : null;
};
