import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { PlusIcon } from '@root/assets';
import { Typography } from '@root/common';

const I18N_PATH = 'components.PurchaseOrderSelect.components.PurchaseOrderFieldFooter.';

const PurchaseOrderFieldFooter = () => {
  const { t } = useTranslation();

  return (
    <Typography cursor="pointer" color="information" variant="bodyMedium">
      <Layouts.Flex alignItems="center">
        <Layouts.IconLayout width="12px" height="12px">
          <PlusIcon />
        </Layouts.IconLayout>
        {t(`${I18N_PATH}CreatePurchaseOrder`)}
      </Layouts.Flex>
    </Typography>
  );
};

export default PurchaseOrderFieldFooter;
