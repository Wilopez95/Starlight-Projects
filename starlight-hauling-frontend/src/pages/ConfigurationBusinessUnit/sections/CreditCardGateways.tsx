import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ISelectOption,
  Layouts,
  Select,
  TextInput,
  useToggle,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { BusinessUnitService } from '@root/api';
import { ApproveIcon, EditIcon } from '@root/assets';
import { Typography } from '@root/common';
import { type IMerchantInput } from '@root/components/forms/AddEditMerchant/types';
import { AddEditMerchantModal } from '@root/components/modals';
import { convertDates, NotificationHelper } from '@root/helpers';
import { PaymentService } from '@root/modules/billing/Payments/api/payment';
import { type BusinessUnit } from '@root/stores/entities';
import { type IBusinessUnit, type IMerchant, type PaymentGateway } from '@root/types';

import styles from './css/styles.scss';

const I18N_PATH = 'pages.SystemConfiguration.tables.BusinessUnit.sections.CreditCardGateways.Text.';

const paymentGatewayOptions: ISelectOption[] = [
  {
    label: 'CardConnect',
    value: 'cardConnect',
  },
  {
    label: 'FluidPay',
    value: 'fluidPay',
  },
];

interface ICreditCardGateways {
  isNew: boolean;
  selectedBusinessUnit?: BusinessUnit;
  isRecyclingFacility?: boolean;
}

const CreditCardGateways: React.FC<ICreditCardGateways> = ({
  isNew,
  selectedBusinessUnit,
  isRecyclingFacility,
}) => {
  const [isCoreMerchantModalOpen, toggleCoreMerchantModal] = useToggle();
  const [isSalespointMerchantModalOpen, toggleSalespointMerchantModal] = useToggle();
  const [availableMerchants, setMerchants] = useState<IMerchant[]>([]);

  const { t } = useTranslation();

  const { values, setFieldValue } = useFormikContext<IBusinessUnit>();

  const [confirmed, setConfirmed] = useState(!isNew);

  useEffect(() => {
    if (selectedBusinessUnit) {
      (async () => {
        const merchants = await BusinessUnitService.getAvailableMerchants(selectedBusinessUnit.id);

        setMerchants(merchants.map(convertDates));
      })();
    }
  }, [selectedBusinessUnit]);

  useEffect(() => {
    setConfirmed(!isNew && !!selectedBusinessUnit?.merchant);
  }, [isNew, selectedBusinessUnit]);

  const handleSaveCoreMerchant = async (data: IMerchantInput) => {
    if (values.merchant?.paymentGateway) {
      toggleCoreMerchantModal();
      // eslint-disable-next-line @typescript-eslint/no-shadow
      let confirmed = true;

      try {
        await PaymentService.validateMerchant({
          ...data,
          paymentGateway: values.merchant?.paymentGateway,
          salespointMid: null,
          salespointUsername: null,
          salespointPassword: null,
          raw: true,
        });
      } catch {
        NotificationHelper.custom('error', t(`${I18N_PATH}InvalidMerchant`));
        confirmed = false;
      } finally {
        setFieldValue('merchant', {
          ...(values.merchant ?? {}),
          ...data,
          coreMidConfirmed: confirmed,
        });
      }
    }
  };

  const handleSaveSalespointMerchant = async (data: IMerchantInput) => {
    if (values.merchant?.paymentGateway) {
      toggleSalespointMerchantModal();
      // eslint-disable-next-line @typescript-eslint/no-shadow
      let confirmed = true;

      try {
        await PaymentService.validateMerchant({
          paymentGateway: values.merchant?.paymentGateway,
          salespointMid: data.mid,
          salespointUsername: data.username,
          salespointPassword: data.password,
          mid: null,
          username: null,
          password: null,
          raw: true,
        });
      } catch {
        NotificationHelper.custom('error', t(`${I18N_PATH}InvalidSalespointMerchant`));
        confirmed = false;
      } finally {
        setFieldValue('merchant', {
          ...(values.merchant ?? {}),
          spMidConfirmed: confirmed,
          salespointMid: data.mid,
          salespointUsername: data.username,
          salespointPassword: data.password,
        });
      }
    }
  };

  const handleGatewayChange = useCallback(
    (_, value: PaymentGateway) => {
      if (value !== values.merchant?.paymentGateway) {
        const existingMerchant = availableMerchants.find(
          ({ paymentGateway }) => paymentGateway === value,
        );

        setFieldValue('merchant', existingMerchant ?? { paymentGateway: value });
      }
    },
    [availableMerchants, setFieldValue, values.merchant?.paymentGateway],
  );

  const isGatewaySelected = !!values.merchant?.paymentGateway;

  return (
    <div className={styles.section}>
      <AddEditMerchantModal
        hasApprovedMerchant={!!values.merchant?.coreMidConfirmed}
        title={t(`${I18N_PATH}Merchant`)}
        initialValues={{
          mid: values.merchant?.mid,
          username: values.merchant?.username,
          password: values.merchant?.password ?? undefined,
        }}
        isOpen={isCoreMerchantModalOpen}
        onClose={toggleCoreMerchantModal}
        onFormSubmit={handleSaveCoreMerchant}
      />
      <AddEditMerchantModal
        hasApprovedMerchant={!!values.merchant?.spMidConfirmed}
        title={t(`${I18N_PATH}SalespointMerchant`)}
        initialValues={{
          mid: values.merchant?.salespointMid ?? undefined,
          username: values.merchant?.salespointUsername ?? undefined,
          password: values.merchant?.salespointPassword ?? undefined,
        }}
        isOpen={isSalespointMerchantModalOpen}
        onClose={toggleSalespointMerchantModal}
        onFormSubmit={handleSaveSalespointMerchant}
      />
      <div className={styles.content}>
        <Typography variant="headerThree" className={styles.spaceBottom}>
          {t(`${I18N_PATH}Title`)}
        </Typography>
        <Layouts.Grid rowGap="1" columns="30% 30% 15%">
          <Typography
            variant="bodyMedium"
            as="label"
            htmlFor="merchant.paymentGateway"
            color="secondary"
            shade="desaturated"
          >
            {t(`${I18N_PATH}CreditCardGateway`)}
          </Typography>
          <Layouts.Cell left={2} width={1}>
            <Select
              nonClearable
              name="merchant.paymentGateway"
              value={values.merchant?.paymentGateway}
              onSelectChange={handleGatewayChange}
              options={paymentGatewayOptions}
            />
          </Layouts.Cell>
          <Layouts.Cell left={1} width={1}>
            <Typography variant="bodyMedium" color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Merchant`)}
            </Typography>
          </Layouts.Cell>
          {!values.merchant?.mid ? (
            <Typography
              variant="bodyMedium"
              color="information"
              cursor="pointer"
              onClick={isGatewaySelected ? toggleCoreMerchantModal : noop}
            >
              + {t(`${I18N_PATH}AddCoreMerchant`)}
            </Typography>
          ) : (
            <>
              <TextInput
                disabled
                name="merchant.mid"
                ariaLabel="merchant.mid"
                value={values.merchant.mid}
                onChange={noop}
                rightIcon={confirmed ? ApproveIcon : undefined}
              />
              <Layouts.Margin top="1" left="1">
                <Typography
                  variant="bodyMedium"
                  cursor="pointer"
                  color="information"
                  onClick={isGatewaySelected ? toggleCoreMerchantModal : noop}
                >
                  <Layouts.Flex alignItems="center">
                    <Layouts.IconLayout>
                      <EditIcon />
                    </Layouts.IconLayout>
                    {t(`${I18N_PATH}EditCoreMerchant`)}
                  </Layouts.Flex>
                </Typography>
              </Layouts.Margin>
            </>
          )}
          {!isRecyclingFacility ? (
            <>
              <Layouts.Cell left={1} width={1}>
                <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                  {t(`${I18N_PATH}SalespointMerchant`)}
                </Typography>
              </Layouts.Cell>
              {!values.merchant?.salespointMid ? (
                <Typography
                  variant="bodyMedium"
                  color="information"
                  cursor="pointer"
                  onClick={isGatewaySelected ? toggleSalespointMerchantModal : noop}
                >
                  + {t(`${I18N_PATH}AddSalespointMerchant`)}
                </Typography>
              ) : (
                <>
                  <TextInput
                    disabled
                    name="merchant.salespointMid"
                    ariaLabel="merchant.salespointMid"
                    value={values.merchant.salespointMid}
                    onChange={noop}
                    rightIcon={confirmed ? ApproveIcon : undefined}
                  />
                  <Layouts.Margin top="1" left="1">
                    <Typography
                      variant="bodyMedium"
                      cursor="pointer"
                      color="information"
                      onClick={isGatewaySelected ? toggleSalespointMerchantModal : noop}
                    >
                      <Layouts.Flex alignItems="center">
                        <Layouts.IconLayout>
                          <EditIcon />
                        </Layouts.IconLayout>
                        {t(`${I18N_PATH}EditSalespointMerchant`)}
                      </Layouts.Flex>
                    </Typography>
                  </Layouts.Margin>
                </>
              )}
            </>
          ) : null}
        </Layouts.Grid>
      </div>
    </div>
  );
};

export default observer(CreditCardGateways);
