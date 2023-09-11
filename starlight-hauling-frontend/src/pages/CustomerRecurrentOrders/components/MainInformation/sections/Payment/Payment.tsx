import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { isAfter, startOfDay } from 'date-fns';
import { useFormikContext } from 'formik';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { type RecurrentOrder } from '@root/stores/entities';

const I18N_PATH = 'pages.CustomerRecurrentOrders.tables.MainInformation.sections.Payment.Text.';

const PaymentSection: React.FC = () => {
  const { values } = useFormikContext<RecurrentOrder>();
  const { t } = useTranslation();

  const { priceGroupStore } = useStores();

  useEffect(() => {
    if (values.customRatesGroup?.originalId) {
      priceGroupStore.requestById(+values.customRatesGroup?.originalId);
    }
  }, [values.billableService?.originalId, values.customRatesGroup?.originalId, priceGroupStore]);

  const selectedPriceGroup = priceGroupStore.selectedEntity;
  const isPriceGroupExpired =
    selectedPriceGroup?.endDate && isAfter(startOfDay(new Date()), selectedPriceGroup.endDate);

  return (
    <Layouts.Cell top={3}>
      <Layouts.Grid gap="2" columns="250px 1fr">
        <Layouts.Cell width={2}>
          <Typography variant="headerFour">{t(`${I18N_PATH}PricingAndPayment`)}</Typography>
        </Layouts.Cell>
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}PricingGroup`)}
        </Typography>
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}PaymentMethod`)}
        </Typography>
        {values.customRatesGroup ? (
          <Layouts.Flex>
            <span>{selectedPriceGroup?.description}</span>
            {isPriceGroupExpired ? (
              <Layouts.Margin left="1">
                <Badge borderRadius={2} color="primary">
                  {t('Text.Expired')}
                </Badge>
              </Layouts.Margin>
            ) : null}
          </Layouts.Flex>
        ) : (
          <Layouts.Flex>
            <span>{t(`${I18N_PATH}GeneralPriceGroup`)}</span>
          </Layouts.Flex>
        )}
        <span>{startCase(values.paymentMethod)}</span>
        <Layouts.Cell width={2}>
          <Divider both />
        </Layouts.Cell>
      </Layouts.Grid>
    </Layouts.Cell>
  );
};

export default observer(PaymentSection);
