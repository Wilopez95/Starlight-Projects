import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RightArrowTriangle } from '@root/assets';
import { Typography } from '@root/common';

import { ILobbyMenuItem } from './types';

import styles from './css/styles.scss';

const LobbyMenuItem: React.FC<ILobbyMenuItem> = ({
  title,
  path,
  address,
  image,
  icon,
  defaultLogo,
  updatedAt = new Date(),
  onClick,
}) => {
  const [imageExist, setImageExist] = useState(true);
  const { t } = useTranslation();
  const imageUrl =
    (image &&
      // do not add "?modified" if it is "data:"
      (image.startsWith('data:') ? image : `${image}?modified=${updatedAt.valueOf()}`)) ||
    '';

  const handleError = useCallback(() => {
    setImageExist(false);
  }, []);

  return (
    <a tabIndex={0} className={styles.menuItemWrapper} href={path} onClick={onClick}>
      <div className={styles.menuItem}>
        {icon ? (
          <div className={styles.menuItemIconWrapper}>
            <div className={styles.menuItemIcon}>{icon}</div>
          </div>
        ) : (
          <div className={styles.menuItemImgWrapper}>
            {image && imageExist ? (
              <img alt={`${title} ${t('Text.Logo')}`} src={imageUrl} onError={handleError} />
            ) : (
              <Typography color="white" className={styles.defaultLogo}>
                {defaultLogo}
              </Typography>
            )}
          </div>
        )}
        <div>
          <Typography variant="bodyMedium" className={styles.ellipsisTitle}>
            {title}
          </Typography>
          {address ? (
            <Typography
              variant="bodySmall"
              fontWeight="bold"
              color="secondary"
              shade="light"
              className={styles.address}
            >
              {address}
            </Typography>
          ) : null}
        </div>
      </div>
      <div className={styles.rightArrow}>
        <RightArrowTriangle />
      </div>
    </a>
  );
};

export default LobbyMenuItem;
