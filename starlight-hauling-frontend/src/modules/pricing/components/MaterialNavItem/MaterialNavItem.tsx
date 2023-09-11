import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { Badge } from '@root/common';

interface IMaterialNavItem {
  text: string;
  active: boolean;
}

const MaterialNavItem: React.FC<IMaterialNavItem> = ({ text, active }) => {
  const { t } = useTranslation();
  const isInactive = !active;

  return (
    <>
      <Layouts.Margin as="span" right={isInactive ? '1' : '0'}>
        {text}
      </Layouts.Margin>
      {isInactive ? <Badge color="alert">{t('Text.Inactive')}</Badge> : null}
    </>
  );
};

export default MaterialNavItem;
